import json
import logging
import os
import secrets
from datetime import datetime
from typing import Optional
from uuid import UUID

# Google renvoie parfois des scopes supplémentaires (openid, userinfo.*) — on accepte
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from cryptography.fernet import Fernet

from backend.database import get_db
from backend.models.database import Artisan, KnowledgeChunk, Prospect, Conversation
from backend.services.rag import RAGService
from backend.config import settings

router = APIRouter(prefix="/api/artisans", tags=["artisans"])
logger = logging.getLogger(__name__)

GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]


class ArtisanCreate(BaseModel):
    name: str
    email: str
    config_json: dict = {}
    clerk_user_id: Optional[str] = None


class ArtisanUpdate(BaseModel):
    name: Optional[str] = None
    config_json: Optional[dict] = None


class QAEntry(BaseModel):
    question: str
    answer: str


@router.post("", status_code=201)
def create_artisan(payload: ArtisanCreate, db: Session = Depends(get_db)):
    # Vérifier par clerk_user_id d'abord (évite la violation de contrainte UNIQUE → 500)
    if payload.clerk_user_id:
        existing_by_clerk = db.query(Artisan).filter(Artisan.clerk_user_id == payload.clerk_user_id).first()
        if existing_by_clerk:
            # Mise à jour silencieuse du config si renvoyé depuis l'onboarding
            if payload.config_json:
                existing_by_clerk.config_json = payload.config_json
                db.commit()
                db.refresh(existing_by_clerk)
            return _artisan_to_dict(existing_by_clerk)

    existing = db.query(Artisan).filter(Artisan.email == payload.email).first()
    if existing:
        # Si l'enregistrement n'a pas encore de clerk_user_id, on le revendique
        if existing.clerk_user_id is None and payload.clerk_user_id:
            existing.clerk_user_id = payload.clerk_user_id
            if payload.config_json:
                existing.config_json = payload.config_json
            db.commit()
            db.refresh(existing)
            return _artisan_to_dict(existing)
        # Email déjà lié à un autre compte Clerk
        raise HTTPException(status_code=409, detail="Email déjà utilisé")

    artisan = Artisan(
        name=payload.name,
        email=payload.email,
        config_json=payload.config_json,
        clerk_user_id=payload.clerk_user_id,
    )
    db.add(artisan)
    db.commit()
    db.refresh(artisan)
    return _artisan_to_dict(artisan)


@router.get("/by-clerk/{clerk_user_id}")
def get_artisan_by_clerk(clerk_user_id: str, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).filter(Artisan.clerk_user_id == clerk_user_id).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan non trouvé")
    return _artisan_to_dict(artisan)


@router.get("/{artisan_id}")
def get_artisan(artisan_id: UUID, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    return _artisan_to_dict(artisan)


@router.put("/{artisan_id}")
def update_artisan(artisan_id: UUID, payload: ArtisanUpdate, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    if payload.name is not None:
        artisan.name = payload.name
    if payload.config_json is not None:
        artisan.config_json = payload.config_json
    db.commit()
    db.refresh(artisan)
    return _artisan_to_dict(artisan)


@router.delete("/{artisan_id}", status_code=204)
def delete_artisan(artisan_id: UUID, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    db.delete(artisan)
    db.commit()


# ── Gmail OAuth ────────────────────────────────────────────────────────────────

GMAIL_CALLBACK_URI = "{api_base}/api/artisans/gmail/callback"


def _gmail_flow(artisan_id: str | None = None, state: str | None = None):
    """Crée un Flow OAuth Google avec URI fixe (artisan_id dans state)."""
    callback_uri = GMAIL_CALLBACK_URI.format(api_base=settings.APP_BASE_URL)
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [callback_uri],
            }
        },
        scopes=GOOGLE_SCOPES,
        state=state,
    )
    flow.redirect_uri = callback_uri
    return flow


@router.post("/{artisan_id}/gmail/connect")
def gmail_connect(artisan_id: UUID, db: Session = Depends(get_db)):
    """Génère l'URL OAuth Google pour connecter Gmail."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Configuration Google OAuth manquante sur le serveur")
    _get_or_404(db, artisan_id)

    flow = _gmail_flow()
    # Encode artisan_id in state: "<artisan_id>:<random>"
    random_part = secrets.token_urlsafe(16)
    state_value = f"{artisan_id}:{random_part}"

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state_value,
    )
    return {"auth_url": auth_url, "state": state_value}


@router.get("/gmail/callback")
def gmail_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """Callback OAuth Google — URI fixe, artisan_id extrait du state."""
    # 1. Valider le state
    try:
        artisan_id_str, _ = state.split(":", 1)
        artisan_id = UUID(artisan_id_str)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="State OAuth invalide")

    artisan = _get_or_404(db, artisan_id)

    # 2. Valider la configuration serveur
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        logger.error("Gmail callback: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?gmail=error&reason=config")

    if not settings.FERNET_KEY:
        logger.error("Gmail callback: FERNET_KEY manquant")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?gmail=error&reason=config")

    # 3. Échanger le code contre un token
    try:
        flow = _gmail_flow(state=state)
        flow.fetch_token(code=code)
    except Exception as exc:
        logger.error(f"Gmail callback: échec fetch_token — {exc}", exc_info=True)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?gmail=error&reason=oauth")

    # 4. Chiffrer et sauvegarder
    try:
        credentials = flow.credentials
        token_data = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "scopes": list(credentials.scopes or []),
        }
        f = Fernet(settings.FERNET_KEY.encode())
        encrypted = f.encrypt(json.dumps(token_data).encode()).decode()
    except Exception as exc:
        logger.error(f"Gmail callback: échec chiffrement token — {exc}", exc_info=True)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?gmail=error&reason=encrypt")

    # 5. Extraire l'email Gmail depuis l'id_token (scope openid inclus par Google)
    gmail_email = None
    try:
        id_token = getattr(credentials, "id_token", None)
        if isinstance(id_token, dict):
            gmail_email = id_token.get("email")
    except Exception:
        pass

    artisan.gmail_token_encrypted = encrypted
    if gmail_email:
        artisan.gmail_email = gmail_email
    db.commit()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/settings?gmail=connected")


@router.delete("/{artisan_id}/gmail/disconnect")
def gmail_disconnect(artisan_id: UUID, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    artisan.gmail_token_encrypted = None
    artisan.gmail_email = None
    db.commit()
    return {"status": "disconnected"}


@router.delete("/{artisan_id}/prospects/{prospect_id}", status_code=204)
def delete_prospect(artisan_id: UUID, prospect_id: UUID, db: Session = Depends(get_db)):
    _get_or_404(db, artisan_id)
    from backend.models.database import Prospect
    prospect = db.query(Prospect).filter(
        Prospect.id == prospect_id,
        Prospect.artisan_id == artisan_id,
    ).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect non trouvé")
    db.delete(prospect)
    db.commit()


# ── Base de connaissances ──────────────────────────────────────────────────────

@router.post("/{artisan_id}/knowledge/upload")
async def upload_document(
    artisan_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload et ingestion d'un PDF dans la base de connaissances."""
    _get_or_404(db, artisan_id)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés")

    content = await file.read()
    rag = RAGService(db)
    count = await rag.ingest_document(
        artisan_id=str(artisan_id),
        file_content=content,
        filename=file.filename,
    )
    return {"status": "ok", "chunks_created": count, "filename": file.filename}


@router.post("/{artisan_id}/knowledge/qa")
async def add_qa(artisan_id: UUID, payload: QAEntry, db: Session = Depends(get_db)):
    """Ajoute une entrée Q&A manuelle."""
    _get_or_404(db, artisan_id)
    rag = RAGService(db)
    await rag.add_qa_entry(str(artisan_id), payload.question, payload.answer)
    return {"status": "ok"}


@router.get("/{artisan_id}/knowledge")
def list_knowledge(artisan_id: UUID, db: Session = Depends(get_db)):
    _get_or_404(db, artisan_id)
    rag = RAGService(db)
    return rag.list_chunks(str(artisan_id))


@router.delete("/{artisan_id}/knowledge/{chunk_id}")
def delete_knowledge(artisan_id: UUID, chunk_id: UUID, db: Session = Depends(get_db)):
    _get_or_404(db, artisan_id)
    rag = RAGService(db)
    deleted = rag.delete_chunk(str(artisan_id), str(chunk_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Chunk non trouvé")
    return {"status": "deleted"}


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, artisan_id: UUID) -> Artisan:
    artisan = db.query(Artisan).filter(Artisan.id == artisan_id).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan non trouvé")
    return artisan


# ── Prospects ─────────────────────────────────────────────────────────────────

@router.get("/{artisan_id}/prospects")
def list_prospects(artisan_id: UUID, db: Session = Depends(get_db)):
    _get_or_404(db, artisan_id)
    prospects = (
        db.query(Prospect)
        .filter(Prospect.artisan_id == artisan_id)
        .order_by(Prospect.created_at.desc())
        .all()
    )
    result = []
    for p in prospects:
        conv = None
        if p.conversations:
            conv = sorted(p.conversations, key=lambda c: c.created_at or datetime.min, reverse=True)[0]
        result.append({
            "id": str(p.id),
            "name": p.name,
            "phone": p.phone,
            "email": p.email,
            "project_type": p.project_type,
            "surface": p.surface,
            "location": p.location,
            "budget": p.budget,
            "delay": p.delay,
            "score": p.score,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "conversation": {
                "id": str(conv.id),
                "channel": conv.channel,
                "status": conv.status,
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
            } if conv else None,
        })
    return result


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/{artisan_id}/reports")
def list_reports(artisan_id: UUID, db: Session = Depends(get_db)):
    _get_or_404(db, artisan_id)
    conversations = db.query(Conversation).filter(Conversation.artisan_id == artisan_id).all()
    result = []
    for conv in conversations:
        if conv.rapport:
            r = conv.rapport
            result.append({
                "id": str(r.id),
                "conversation_id": str(conv.id),
                "channel": conv.channel,
                "html_content": r.html_content,
                "sent_at": r.sent_at.isoformat() if r.sent_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "prospect": {
                    "id": str(conv.prospect.id),
                    "name": conv.prospect.name,
                    "score": conv.prospect.score,
                } if conv.prospect else None,
            })
    result.sort(key=lambda x: x["created_at"] or "", reverse=True)
    return result


# ── Readiness ─────────────────────────────────────────────────────────────────

@router.get("/{artisan_id}/readiness")
def get_readiness(artisan_id: UUID, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    config = artisan.config_json or {}

    gmail_connected = artisan.gmail_token_encrypted is not None
    knowledge_ready = db.query(KnowledgeChunk).filter(KnowledgeChunk.artisan_id == artisan_id).count() > 0
    bot_config_ready = bool(config.get("metier"))
    welcome_message_ready = bool(config.get("message_accueil"))
    has_test_conversation = db.query(Conversation).filter(Conversation.artisan_id == artisan_id).count() > 0

    steps = [gmail_connected, knowledge_ready, bot_config_ready, welcome_message_ready, has_test_conversation]
    return {
        "gmail_connected": gmail_connected,
        "knowledge_ready": knowledge_ready,
        "bot_config_ready": bot_config_ready,
        "welcome_message_ready": welcome_message_ready,
        "has_test_conversation": has_test_conversation,
        "completed_steps": sum(1 for s in steps if s),
        "total_steps": 5,
    }


def _artisan_to_dict(artisan: Artisan) -> dict:
    return {
        "id": str(artisan.id),
        "name": artisan.name,
        "email": artisan.email,
        "config_json": artisan.config_json,
        "gmail_connected": artisan.gmail_token_encrypted is not None,
        "gmail_email": artisan.gmail_email,
        "twilio_number": artisan.twilio_number,
        "created_at": artisan.created_at.isoformat() if artisan.created_at else None,
    }
