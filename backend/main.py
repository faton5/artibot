import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database import engine, Base
from backend.api.routes import webhook, artisan, conversation, geo, dev

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialisation et cleanup au démarrage/arrêt."""
    logger.info("ArtiBot backend démarrage...")
    # Crée les tables si elles n'existent pas (en prod, utiliser les migrations SQL)
    Base.metadata.create_all(bind=engine)
    logger.info("Base de données initialisée")
    yield
    logger.info("ArtiBot backend arrêt")


app = FastAPI(
    title="ArtiBot API",
    description="Assistant IA pour artisans — Backend FastAPI",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(webhook.router)
app.include_router(artisan.router)
app.include_router(conversation.router)
app.include_router(geo.router)
app.include_router(dev.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "artibot-backend", "version": "2.0.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erreur non gérée : {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur"},
    )
