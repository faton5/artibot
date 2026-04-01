import base64
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from cryptography.fernet import Fernet

from backend.services.channels.base import BaseChannel, Message
from backend.config import settings

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]


class GmailChannel(BaseChannel):
    """Canal Gmail OAuth — reçoit via Pub/Sub, répond via Gmail API."""

    def __init__(self, artisan_id: str, encrypted_token: str):
        self.artisan_id = artisan_id
        self.encrypted_token = encrypted_token
        self._credentials: Optional[Credentials] = None

    @property
    def channel_name(self) -> str:
        return "email"

    def _get_fernet(self) -> Fernet:
        key = settings.FERNET_KEY.encode() if isinstance(settings.FERNET_KEY, str) else settings.FERNET_KEY
        return Fernet(key)

    def _decrypt_token(self) -> dict:
        f = self._get_fernet()
        decrypted = f.decrypt(self.encrypted_token.encode())
        return json.loads(decrypted.decode())

    def encrypt_token(self, token_data: dict) -> str:
        f = self._get_fernet()
        return f.encrypt(json.dumps(token_data).encode()).decode()

    def get_credentials(self) -> Credentials:
        if self._credentials and self._credentials.valid:
            return self._credentials

        token_data = self._decrypt_token()
        creds = Credentials(
            token=token_data.get("token"),
            refresh_token=token_data.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES,
        )

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        self._credentials = creds
        return creds

    def _get_service(self):
        creds = self.get_credentials()
        return build("gmail", "v1", credentials=creds)

    async def receive(self, payload: dict) -> Message:
        """Décode un message Pub/Sub Gmail et récupère l'email complet."""
        # Payload Pub/Sub : {"message": {"data": "<base64>", ...}}
        pubsub_data = payload.get("message", {}).get("data", "")
        if pubsub_data:
            decoded = base64.b64decode(pubsub_data + "==").decode("utf-8")
            notification = json.loads(decoded)
        else:
            notification = payload

        email_address = notification.get("emailAddress", "")
        history_id = notification.get("historyId", "")

        service = self._get_service()

        # Récupère les nouveaux messages depuis historyId
        history = service.users().history().list(
            userId="me",
            startHistoryId=history_id,
            historyTypes=["messageAdded"],
        ).execute()

        messages_added = []
        for record in history.get("history", []):
            for msg in record.get("messagesAdded", []):
                messages_added.append(msg["message"]["id"])

        if not messages_added:
            raise ValueError("Aucun nouveau message dans cette notification Pub/Sub")

        msg_id = messages_added[0]
        msg = service.users().messages().get(
            userId="me",
            id=msg_id,
            format="full",
        ).execute()

        headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
        sender = headers.get("From", "")
        subject = headers.get("Subject", "")
        thread_id = msg.get("threadId", "")

        # Extrait le corps du message
        body = self._extract_body(msg["payload"])

        return Message(
            sender=sender,
            content=body,
            channel="email",
            raw_payload=payload,
            subject=subject,
            thread_id=thread_id,
            message_id=msg_id,
            artisan_email=email_address,
        )

    def _extract_body(self, payload: dict) -> str:
        if "body" in payload and payload["body"].get("data"):
            return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")

        for part in payload.get("parts", []):
            if part.get("mimeType") == "text/plain":
                data = part.get("body", {}).get("data", "")
                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

        # Fallback : texte HTML
        for part in payload.get("parts", []):
            if part.get("mimeType") == "text/html":
                data = part.get("body", {}).get("data", "")
                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

        return ""

    async def send(self, to: str, content: str, context: dict = None) -> None:
        """Envoie une réponse email depuis l'adresse de l'artisan."""
        service = self._get_service()
        context = context or {}

        msg = MIMEMultipart("alternative")
        msg["To"] = to
        msg["Subject"] = context.get("subject", "Re: Votre demande")
        if context.get("thread_id"):
            msg["References"] = context.get("message_id", "")
            msg["In-Reply-To"] = context.get("message_id", "")

        part = MIMEText(content, "plain", "utf-8")
        msg.attach(part)

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        body = {"raw": raw}
        if context.get("thread_id"):
            body["threadId"] = context["thread_id"]

        service.users().messages().send(userId="me", body=body).execute()
        logger.info(f"Email envoyé à {to}")

    async def mark_as_read(self, message_id: str) -> None:
        service = self._get_service()
        service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"removeLabelIds": ["UNREAD"], "addLabelIds": []},
        ).execute()

    async def setup_push_notifications(self, topic_name: str) -> dict:
        """Configure les Push Notifications Gmail vers un topic Pub/Sub."""
        service = self._get_service()
        return service.users().watch(
            userId="me",
            body={
                "labelIds": ["INBOX"],
                "topicName": topic_name,
            },
        ).execute()
