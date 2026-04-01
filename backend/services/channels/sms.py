import logging
from twilio.rest import Client

from backend.services.channels.base import BaseChannel, Message
from backend.config import settings

logger = logging.getLogger(__name__)


class SMSChannel(BaseChannel):
    """Canal SMS via Twilio — webhook HTTP POST direct."""

    def __init__(self, artisan_twilio_number: str):
        self.artisan_twilio_number = artisan_twilio_number
        self._client: Client = None

    @property
    def channel_name(self) -> str:
        return "sms"

    def _get_client(self) -> Client:
        if not self._client:
            self._client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        return self._client

    async def receive(self, payload: dict) -> Message:
        """Parse le payload Twilio (form-urlencoded converti en dict)."""
        sender = payload.get("From", "")
        body = payload.get("Body", "")
        message_sid = payload.get("MessageSid", "")
        to = payload.get("To", self.artisan_twilio_number)

        return Message(
            sender=sender,
            content=body,
            channel="sms",
            raw_payload=payload,
            message_id=message_sid,
            artisan_email=None,
        )

    async def send(self, to: str, content: str, context: dict = None) -> None:
        """Envoie un SMS via Twilio depuis le numéro dédié de l'artisan."""
        client = self._get_client()
        message = client.messages.create(
            body=content,
            from_=self.artisan_twilio_number,
            to=to,
        )
        logger.info(f"SMS envoyé à {to} — SID: {message.sid}")

    @staticmethod
    async def purchase_number(area_code: str = "75") -> str:
        """Achète un numéro Twilio pour un nouvel artisan."""
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        available = client.available_phone_numbers("FR").local.list(
            area_code=area_code, limit=1
        )
        if not available:
            available = client.available_phone_numbers("FR").local.list(limit=1)
        if not available:
            raise ValueError("Aucun numéro disponible")

        purchased = client.incoming_phone_numbers.create(
            phone_number=available[0].phone_number,
            sms_url="https://api.artibot.fr/api/webhook/sms",
        )
        return purchased.phone_number
