from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # OpenAI — LLM principal (GPT-4o) + embeddings (text-embedding-3-small)
    OPENAI_API_KEY: str

    # Voyage AI — embeddings alternatifs (optionnel)
    VOYAGE_API_KEY: Optional[str] = None

    # Google / Gmail OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_PUBSUB_PROJECT_ID: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/artisans/{artisan_id}/gmail/callback"

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""

    # Resend (transactional email)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"

    # URL publique de l'app (pour les webhooks Twilio)
    APP_BASE_URL: str = "http://localhost:8000"

    # Clerk
    CLERK_SECRET_KEY: str = ""

    # Encryption (Fernet) for OAuth tokens
    FERNET_KEY: str = ""

    # Database
    DATABASE_URL: str = "postgresql://artibot:artibot@localhost:5432/artibot"

    # Frontend
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
