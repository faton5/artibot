from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Message:
    sender: str           # email ou numéro de téléphone de l'expéditeur
    content: str          # corps du message
    channel: str          # "email" | "sms" | "whatsapp"
    raw_payload: dict = field(default_factory=dict)
    subject: Optional[str] = None          # pour email
    thread_id: Optional[str] = None        # pour email (thread Gmail)
    message_id: Optional[str] = None       # ID Gmail interne (ex: 19d58xxx)
    email_message_id: Optional[str] = None # vrai Message-ID RFC822 (ex: <xxx@mail.gmail.com>)
    artisan_email: Optional[str] = None    # email de l'artisan destinataire


class BaseChannel(ABC):
    """Interface commune pour tous les canaux de communication."""

    @abstractmethod
    async def receive(self, payload: dict) -> Message:
        """Transforme un payload webhook brut en Message normalisé."""
        ...

    @abstractmethod
    async def send(self, to: str, content: str, context: dict = None) -> None:
        """Envoie un message au prospect via le canal approprié."""
        ...

    @property
    @abstractmethod
    def channel_name(self) -> str:
        """Nom du canal : email / sms / whatsapp."""
        ...
