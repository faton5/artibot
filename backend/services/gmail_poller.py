"""
Polling automatique Gmail — vérifie les nouveaux emails non lus toutes les N secondes.
Lancé comme tâche asyncio au démarrage du backend.
"""
import asyncio
import logging

from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.database import Artisan
from backend.services.channels.gmail import GmailChannel

logger = logging.getLogger(__name__)

POLL_INTERVAL = 300  # secondes (5 minutes)
MAX_PER_ARTISAN = 10  # emails max à traiter par cycle

AUTOMATED_PATTERNS = [
    "noreply", "no-reply", "donotreply", "do-not-reply",
    "newsletter", "notifications@", "notify@", "alerts@",
    "mailer@", "bounce@", "postmaster@", "marketing@",
]

# Mots-clés indiquant un email de prospect (au moins un doit être présent)
PROSPECT_KEYWORDS = [
    "devis", "travaux", "rénovation", "renovation", "installation",
    "réparation", "reparation", "chantier", "intervention", "urgence",
    "plomberie", "électricité", "electricite", "peinture", "carrelage",
    "maçonnerie", "maconnerie", "toiture", "isolation", "chauffage",
    "climatisation", "menuiserie", "plâtrerie", "platrerie", "façade",
    "facade", "cuisine", "salle de bain", "contact", "demande",
    "disponible", "disponibilité", "tarif", "prix", "budget",
    "renseignement", "information", "projet", "surface", "m²", "m2",
]


def _is_prospect_email(subject: str, body: str) -> bool:
    """Vérifie si l'email contient au moins un mot-clé prospect."""
    text = (subject + " " + body[:2000]).lower()
    return any(kw in text for kw in PROSPECT_KEYWORDS)


async def _poll_artisan(artisan: Artisan, db: Session) -> int:
    """Traite les emails non lus d'un artisan. Retourne le nombre traité."""
    from backend.api.routes.webhook import _process_message

    channel = GmailChannel(str(artisan.id), artisan.gmail_token_encrypted)
    try:
        service = channel._get_service()
        result = service.users().messages().list(
            userId="me",
            labelIds=["INBOX", "UNREAD"],
            maxResults=MAX_PER_ARTISAN,
        ).execute()
    except Exception as e:
        logger.error(f"gmail_poller: erreur liste messages pour {artisan.email} — {e}")
        return 0

    messages_raw = result.get("messages", [])
    processed = 0

    for m in messages_raw:
        try:
            msg = service.users().messages().get(userId="me", id=m["id"], format="full").execute()
            headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
            sender = headers.get("From", "")
            subject = headers.get("Subject", "(sans objet)")
            thread_id = msg.get("threadId", "")
            email_message_id = headers.get("Message-ID", "")

            # Ignore expéditeurs automatiques et newsletters
            sender_lower = sender.lower()
            if any(p in sender_lower for p in AUTOMATED_PATTERNS):
                await channel.mark_as_read(m["id"])
                continue
            if headers.get("List-Unsubscribe") or headers.get("List-ID"):
                await channel.mark_as_read(m["id"])
                continue

            body = channel._extract_body(msg["payload"])
            if not body.strip():
                await channel.mark_as_read(m["id"])
                continue

            body = body[:6000]

            # Ignore les emails sans mot-clé prospect
            if not _is_prospect_email(subject, body):
                await channel.mark_as_read(m["id"])
                logger.debug(f"gmail_poller: ignoré (hors-sujet) — {subject[:60]}")
                continue

            context = {
                "thread_id": thread_id,
                "message_id": m["id"],
                "email_message_id": email_message_id,
                "subject": f"Re: {subject}",
            }

            await _process_message(
                db=db,
                artisan=artisan,
                sender=sender,
                content=body,
                channel_name="email",
                channel_context=context,
                channel_instance=channel,
            )
            await channel.mark_as_read(m["id"])
            processed += 1

        except Exception as e:
            logger.error(f"gmail_poller: erreur traitement message {m['id']} — {e}")

    return processed


async def gmail_polling_loop():
    """Boucle infinie : poll tous les artisans avec Gmail connecté."""
    logger.info(f"gmail_poller: démarrage (intervalle {POLL_INTERVAL}s)")
    while True:
        await asyncio.sleep(POLL_INTERVAL)
        db: Session = SessionLocal()
        try:
            artisans = db.query(Artisan).filter(
                Artisan.gmail_token_encrypted.isnot(None)
            ).all()

            if not artisans:
                continue

            logger.info(f"gmail_poller: {len(artisans)} artisan(s) à vérifier")
            for artisan in artisans:
                try:
                    count = await _poll_artisan(artisan, db)
                    if count:
                        logger.info(f"gmail_poller: {count} email(s) traités pour {artisan.email}")
                except Exception as e:
                    logger.error(f"gmail_poller: erreur artisan {artisan.email} — {e}")
        finally:
            db.close()
