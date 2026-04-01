import base64
import json
import logging
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, Depends, Form
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.database import Artisan, Conversation, Prospect, Rapport
from backend.services.channels.gmail import GmailChannel
from backend.services.channels.sms import SMSChannel
from backend.services.rag import RAGService
from backend.services.llm import LLMService
from backend.services.qualification import QualificationService
from backend.services.email_service import EmailService
from backend.config import settings

router = APIRouter(prefix="/api/webhook", tags=["webhooks"])
logger = logging.getLogger(__name__)

llm_service = LLMService()
qualification_service = QualificationService()
email_service = EmailService()


async def _process_message(
    db: Session,
    artisan: Artisan,
    sender: str,
    content: str,
    channel_name: str,
    channel_context: dict,
    channel_instance,
) -> dict:
    """Logique commune de traitement d'un message entrant."""

    # 1. Récupère ou crée la conversation
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.artisan_id == artisan.id,
            Conversation.status.in_(["active", "escalated"]),
        )
        .join(Prospect)
        .filter(
            (Prospect.phone == sender) | (Prospect.email == sender)
        )
        .first()
    )

    if not conversation:
        # Nouveau prospect
        prospect = Prospect(
            artisan_id=artisan.id,
            phone=sender if channel_name == "sms" else None,
            email=sender if channel_name == "email" else None,
        )
        db.add(prospect)
        db.flush()

        conversation = Conversation(
            artisan_id=artisan.id,
            prospect_id=prospect.id,
            channel=channel_name,
            status="active",
            messages_json=[],
            bot_active=1,
        )
        db.add(conversation)
        db.flush()
    else:
        prospect = conversation.prospect

    # Vérifie si le bot est actif
    if not conversation.bot_active:
        logger.info(f"Bot désactivé pour conversation {conversation.id} — message ignoré")
        return {"status": "bot_inactive"}

    # 2. Ajoute le message à l'historique
    messages = list(conversation.messages_json or [])
    messages.append({"from": "prospect", "content": content, "channel": channel_name})
    conversation.messages_json = messages

    # 3. RAG search
    rag_service = RAGService(db)
    rag_chunks = await rag_service.search(str(artisan.id), content, top_k=5)

    # 4. Config artisan
    artisan_config = {
        "id": str(artisan.id),
        "name": artisan.name,
        "email": artisan.email,
        "config_json": artisan.config_json or {},
    }

    # 5. Génération réponse Claude
    llm_result = await llm_service.generate_response(
        artisan_config=artisan_config,
        conversation_history=messages[:-1],
        prospect_message=content,
        rag_chunks=rag_chunks,
    )

    bot_response = llm_result.get("response", "Merci pour votre message, je reviens vers vous rapidement.")
    prospect_data_extracted = llm_result.get("prospect_data", {})
    score = llm_result.get("score", "cold")

    # 6. Mise à jour prospect
    existing_prospect_data = {
        "name": prospect.name,
        "phone": prospect.phone,
        "email": prospect.email,
        "project_type": prospect.project_type,
        "surface": prospect.surface,
        "location": prospect.location,
        "budget": prospect.budget,
        "delay": prospect.delay,
    }
    merged = qualification_service.merge_prospect_data(existing_prospect_data, prospect_data_extracted)
    prospect.name = merged.get("name") or prospect.name
    prospect.project_type = merged.get("project_type")
    prospect.surface = merged.get("surface")
    prospect.location = merged.get("location")
    prospect.budget = merged.get("budget")
    prospect.delay = merged.get("delay")
    if merged.get("phone") and not prospect.phone:
        prospect.phone = merged["phone"]
    if merged.get("email") and not prospect.email:
        prospect.email = merged["email"]
    prospect.score = score

    # 7. Ajoute la réponse bot à l'historique
    messages.append({"from": "bot", "content": bot_response, "channel": channel_name})
    conversation.messages_json = messages

    # 8. Évaluation qualification
    qual_result = qualification_service.evaluate_qualification(
        conversation={"messages_json": messages, "status": conversation.status},
        prospect_data=merged,
        artisan_config=artisan.config_json or {},
    )

    if qual_result["should_qualify"]:
        conversation.status = "qualified"
        dashboard_url = f"{settings.NEXT_PUBLIC_API_URL}/dashboard/{conversation.id}"

        # Génération rapport HTML
        try:
            html = await llm_service.generate_report_html(
                artisan_config=artisan_config,
                prospect_data=merged,
                conversation_history=messages,
                score=score,
                dashboard_url=dashboard_url,
            )
        except Exception:
            html = email_service.generate_fallback_html(
                artisan_name=artisan.name,
                prospect_data=merged,
                score=score,
                last_messages=messages[-5:],
                dashboard_url=dashboard_url,
                channel=channel_name,
            )

        rapport = Rapport(
            conversation_id=conversation.id,
            html_content=html,
        )
        db.add(rapport)
        db.flush()

        # Envoi email artisan
        sent = await email_service.send_qualification_report(
            artisan_email=artisan.email,
            artisan_name=artisan.name,
            html_content=html,
            prospect_name=prospect.name,
        )
        if sent:
            from datetime import datetime
            rapport.sent_at = datetime.utcnow()

    db.commit()

    # 9. Envoie la réponse via le canal
    await channel_instance.send(to=sender, content=bot_response, context=channel_context)

    return {
        "status": "ok",
        "conversation_id": str(conversation.id),
        "score": score,
        "qualified": qual_result["should_qualify"],
    }


@router.post("/gmail")
async def gmail_webhook(request: Request, db: Session = Depends(get_db)):
    """Webhook Google Pub/Sub — notifications Gmail entrants."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload JSON invalide")

    # Decode le message Pub/Sub
    pubsub_message = body.get("message", {})
    data_b64 = pubsub_message.get("data", "")
    if not data_b64:
        return {"status": "no_data"}

    try:
        decoded = base64.b64decode(data_b64 + "==").decode("utf-8")
        notification = json.loads(decoded)
    except Exception as e:
        logger.error(f"Erreur décodage Pub/Sub : {e}")
        raise HTTPException(status_code=400, detail="Données Pub/Sub invalides")

    artisan_email = notification.get("emailAddress", "")
    if not artisan_email:
        return {"status": "no_email"}

    artisan = db.query(Artisan).filter(Artisan.email == artisan_email).first()
    if not artisan or not artisan.gmail_token_encrypted:
        logger.warning(f"Artisan non trouvé ou Gmail non connecté : {artisan_email}")
        return {"status": "artisan_not_found"}

    channel = GmailChannel(str(artisan.id), artisan.gmail_token_encrypted)

    try:
        message = await channel.receive(body)
    except Exception as e:
        logger.error(f"Erreur réception Gmail : {e}")
        return {"status": "error", "detail": str(e)}

    # Marque comme lu
    if message.message_id:
        try:
            await channel.mark_as_read(message.message_id)
        except Exception:
            pass

    context = {
        "thread_id": message.thread_id,
        "message_id": message.message_id,
        "subject": f"Re: {message.subject}" if message.subject else "Re: Votre demande",
    }

    return await _process_message(
        db=db,
        artisan=artisan,
        sender=message.sender,
        content=message.content,
        channel_name="email",
        channel_context=context,
        channel_instance=channel,
    )


@router.post("/sms")
async def sms_webhook(
    From: str = Form(...),
    Body: str = Form(...),
    To: str = Form(...),
    MessageSid: str = Form(default=""),
    db: Session = Depends(get_db),
):
    """Webhook Twilio SMS."""
    artisan = db.query(Artisan).filter(Artisan.twilio_number == To).first()
    if not artisan:
        logger.warning(f"Artisan non trouvé pour le numéro Twilio : {To}")
        raise HTTPException(status_code=404, detail="Artisan non trouvé")

    channel = SMSChannel(artisan_twilio_number=To)
    payload = {"From": From, "Body": Body, "To": To, "MessageSid": MessageSid}
    message = await channel.receive(payload)

    return await _process_message(
        db=db,
        artisan=artisan,
        sender=From,
        content=Body,
        channel_name="sms",
        channel_context={},
        channel_instance=channel,
    )
