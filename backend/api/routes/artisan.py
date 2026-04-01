import json
import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from cryptography.fernet import Fernet

from backend.database import get_db
from backend.models.database import Artisan, KnowledgeChunk
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
    existing = db.query(Artisan).filter(Artisan.email == payload.email).first()
    if existing:
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

@router.post("/{artisan_id}/gmail/connect")
def gmail_connect(artisan_id: UUID, db: Session = Depends(get_db)):
    """Génère l'URL OAuth Google pour connecter Gmail."""
    _get_or_404(db, artisan_id)

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{settings.NEXT_PUBLIC_API_URL}/api/artisans/{artisan_id}/gmail/callback"],
            }
        },
        scopes=GOOGLE_SCOPES,
    )
    flow.redirect_uri = f"{settings.NEXT_PUBLIC_API_URL}/api/artisans/{artisan_id}/gmail/callback"

    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return {"auth_url": auth_url, "state": state}


@router.get("/{artisan_id}/gmail/callback")
def gmail_callback(
    artisan_id: UUID,
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """Callback OAuth Google — stocke le refresh_token chiffré."""
    artisan = _get_or_404(db, artisan_id)

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{settings.NEXT_PUBLIC_API_URL}/api/artisans/{artisan_id}/gmail/callback"],
            }
        },
        scopes=GOOGLE_SCOPES,
        state=state,
    )
    flow.redirect_uri = f"{settings.NEXT_PUBLIC_API_URL}/api/artisans/{artisan_id}/gmail/callback"
    flow.fetch_token(code=code)

    credentials = flow.credentials
    token_data = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "scopes": list(credentials.scopes or []),
    }

    # Chiffrement Fernet
    f = Fernet(settings.FERNET_KEY.encode())
    encrypted = f.encrypt(json.dumps(token_data).encode()).decode()

    artisan.gmail_token_encrypted = encrypted
    db.commit()

    # Redirection vers le frontend
    return RedirectResponse(url=f"{settings.NEXT_PUBLIC_API_URL.replace('8000', '3000')}/settings?gmail=connected")


@router.delete("/{artisan_id}/gmail/disconnect")
def gmail_disconnect(artisan_id: UUID, db: Session = Depends(get_db)):
    artisan = _get_or_404(db, artisan_id)
    artisan.gmail_token_encrypted = None
    db.commit()
    return {"status": "disconnected"}


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


def _artisan_to_dict(artisan: Artisan) -> dict:
    return {
        "id": str(artisan.id),
        "name": artisan.name,
        "email": artisan.email,
        "config_json": artisan.config_json,
        "gmail_connected": artisan.gmail_token_encrypted is not None,
        "twilio_number": artisan.twilio_number,
        "created_at": artisan.created_at.isoformat() if artisan.created_at else None,
    }
