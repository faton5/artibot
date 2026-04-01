import logging
from uuid import UUID
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.database import Conversation, Prospect, Artisan, Rapport
from backend.services.channels.gmail import GmailChannel
from backend.services.channels.sms import SMSChannel

router = APIRouter(prefix="/api/conversations", tags=["conversations"])
logger = logging.getLogger(__name__)


class ReplyPayload(BaseModel):
    content: str


@router.get("")
def list_conversations(
    artisan_id: UUID = Query(...),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Liste toutes les conversations d'un artisan."""
    q = db.query(Conversation).filter(Conversation.artisan_id == artisan_id)
    if status:
        q = q.filter(Conversation.status == status)
    conversations = q.order_by(Conversation.created_at.desc()).all()
    return [_conversation_summary(c) for c in conversations]


@router.get("/{conversation_id}")
def get_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    """Détail complet d'une conversation avec messages et prospect."""
    conv = _get_or_404(db, conversation_id)
    return _conversation_detail(conv)


@router.post("/{conversation_id}/takeover")
def takeover_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    """L'artisan reprend la main — le bot est désactivé sur cette conversation."""
    conv = _get_or_404(db, conversation_id)
    conv.bot_active = 0
    conv.status = "escalated"
    db.commit()
    return {"status": "bot_disabled", "conversation_id": str(conversation_id)}


@router.post("/{conversation_id}/resume_bot")
def resume_bot(conversation_id: UUID, db: Session = Depends(get_db)):
    """Réactive le bot sur une conversation escaladée."""
    conv = _get_or_404(db, conversation_id)
    conv.bot_active = 1
    if conv.status == "escalated":
        conv.status = "active"
    db.commit()
    return {"status": "bot_enabled", "conversation_id": str(conversation_id)}


@router.post("/{conversation_id}/reply")
async def artisan_reply(
    conversation_id: UUID,
    payload: ReplyPayload,
    db: Session = Depends(get_db),
):
    """L'artisan répond manuellement — le message est envoyé via le bon canal."""
    conv = _get_or_404(db, conversation_id)
    artisan = db.query(Artisan).filter(Artisan.id == conv.artisan_id).first()
    prospect = conv.prospect

    if not prospect:
        raise HTTPException(status_code=400, detail="Aucun prospect associé à cette conversation")

    # Envoi via le canal approprié
    try:
        if conv.channel == "email":
            if not artisan.gmail_token_encrypted:
                raise HTTPException(status_code=400, detail="Gmail non connecté")
            channel = GmailChannel(str(artisan.id), artisan.gmail_token_encrypted)
            await channel.send(
                to=prospect.email or "",
                content=payload.content,
                context={},
            )
        elif conv.channel == "sms":
            if not artisan.twilio_number:
                raise HTTPException(status_code=400, detail="Numéro Twilio non configuré")
            channel = SMSChannel(artisan.twilio_number)
            await channel.send(to=prospect.phone or "", content=payload.content)
        else:
            raise HTTPException(status_code=400, detail=f"Canal {conv.channel} non supporté pour l'envoi manuel")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur envoi réponse artisan : {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Ajoute le message à l'historique
    messages = list(conv.messages_json or [])
    messages.append({
        "from": "artisan",
        "content": payload.content,
        "channel": conv.channel,
        "sent_at": datetime.utcnow().isoformat(),
    })
    conv.messages_json = messages
    db.commit()

    return {"status": "sent"}


@router.post("/{conversation_id}/close")
def close_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    conv = _get_or_404(db, conversation_id)
    conv.status = "closed"
    db.commit()
    return {"status": "closed"}


@router.get("/{conversation_id}/report")
def get_report(conversation_id: UUID, db: Session = Depends(get_db)):
    """Retourne le rapport de qualification HTML."""
    conv = _get_or_404(db, conversation_id)
    rapport = db.query(Rapport).filter(Rapport.conversation_id == conversation_id).first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Aucun rapport pour cette conversation")
    return {
        "id": str(rapport.id),
        "html_content": rapport.html_content,
        "sent_at": rapport.sent_at.isoformat() if rapport.sent_at else None,
        "created_at": rapport.created_at.isoformat(),
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, conversation_id: UUID) -> Conversation:
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    return conv


def _conversation_summary(conv: Conversation) -> dict:
    prospect = conv.prospect
    messages = conv.messages_json or []
    last_msg = messages[-1] if messages else None

    return {
        "id": str(conv.id),
        "channel": conv.channel,
        "status": conv.status,
        "bot_active": bool(conv.bot_active),
        "message_count": len(messages),
        "last_message": last_msg,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "prospect": {
            "id": str(prospect.id) if prospect else None,
            "name": prospect.name if prospect else None,
            "score": prospect.score if prospect else "cold",
            "phone": prospect.phone if prospect else None,
            "email": prospect.email if prospect else None,
        } if prospect else None,
    }


def _conversation_detail(conv: Conversation) -> dict:
    summary = _conversation_summary(conv)
    summary["messages"] = conv.messages_json or []
    prospect = conv.prospect
    if prospect:
        summary["prospect"]["project_type"] = prospect.project_type
        summary["prospect"]["surface"] = prospect.surface
        summary["prospect"]["location"] = prospect.location
        summary["prospect"]["budget"] = prospect.budget
        summary["prospect"]["delay"] = prospect.delay
    return summary
