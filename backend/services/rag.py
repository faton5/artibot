import io
import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.models.database import KnowledgeChunk
from backend.config import settings

logger = logging.getLogger(__name__)

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_DIM = 1024


def _get_openai_client():
    from openai import OpenAI
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Génère des embeddings via OpenAI text-embedding-3-small (1024 dims)."""
    client = _get_openai_client()
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small",
        dimensions=EMBEDDING_DIM,
    )
    return [item.embedding for item in response.data]


def get_query_embedding(query: str) -> list[float]:
    """Génère un embedding de requête via OpenAI text-embedding-3-small (1024 dims)."""
    client = _get_openai_client()
    response = client.embeddings.create(
        input=[query],
        model="text-embedding-3-small",
        dimensions=EMBEDDING_DIM,
    )
    return response.data[0].embedding


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extrait le texte d'un PDF. Fallback OCR si le PDF est scanné."""
    import fitz  # pymupdf

    doc = fitz.open(stream=file_content, filetype="pdf")
    text_parts = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        if len(text.strip()) < 50:
            # PDF scanné — fallback OCR
            logger.info(f"Page {page_num + 1} : PDF scanné détecté, activation OCR")
            try:
                import pytesseract
                from PIL import Image

                pix = page.get_pixmap(dpi=200)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img, lang="fra")
            except ImportError:
                logger.warning("pytesseract non disponible, page ignorée")
        text_parts.append(text)

    doc.close()
    return "\n\n".join(text_parts)


class RAGService:
    """Pipeline RAG : ingestion de documents, recherche vectorielle."""

    def __init__(self, db: Session):
        self.db = db
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )

    async def ingest_document(
        self,
        artisan_id: str,
        file_content: bytes,
        filename: str,
        plain_text: Optional[str] = None,
    ) -> int:
        """
        Ingère un document PDF ou texte dans la base de connaissances.
        Retourne le nombre de chunks créés.
        """
        if plain_text:
            text = plain_text
        else:
            text = extract_text_from_pdf(file_content)

        if not text.strip():
            logger.warning(f"Aucun texte extrait de {filename}")
            return 0

        chunks = self.splitter.split_text(text)
        logger.info(f"{len(chunks)} chunks générés depuis {filename}")

        embeddings = get_embeddings(chunks)

        for content, embedding in zip(chunks, embeddings):
            chunk = KnowledgeChunk(
                artisan_id=artisan_id,
                content=content,
                embedding=embedding,
                source_file=filename,
            )
            self.db.add(chunk)

        self.db.commit()
        return len(chunks)

    async def add_qa_entry(self, artisan_id: str, question: str, answer: str) -> None:
        """Ajoute une entrée Q&A manuelle dans la base de connaissances."""
        text = f"Question : {question}\nRéponse : {answer}"
        embeddings = get_embeddings([text])

        chunk = KnowledgeChunk(
            artisan_id=artisan_id,
            content=text,
            embedding=embeddings[0],
            source_file="qa_manuel",
        )
        self.db.add(chunk)
        self.db.commit()

    async def search(
        self,
        artisan_id: str,
        query: str,
        top_k: int = 5,
    ) -> list[str]:
        """
        Recherche les chunks les plus pertinents par similarité cosinus.
        Retourne une liste de textes de chunks.
        """
        query_embedding = get_query_embedding(query)

        results = (
            self.db.query(KnowledgeChunk)
            .filter(KnowledgeChunk.artisan_id == artisan_id)
            .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
            .all()
        )

        return [chunk.content for chunk in results]

    def list_chunks(self, artisan_id: str) -> list[dict]:
        """Liste tous les chunks d'un artisan."""
        chunks = (
            self.db.query(KnowledgeChunk)
            .filter(KnowledgeChunk.artisan_id == artisan_id)
            .order_by(KnowledgeChunk.created_at.desc())
            .all()
        )
        return [
            {
                "id": str(c.id),
                "content": c.content[:200] + "..." if len(c.content) > 200 else c.content,
                "source_file": c.source_file,
                "created_at": c.created_at.isoformat(),
            }
            for c in chunks
        ]

    def delete_chunk(self, artisan_id: str, chunk_id: str) -> bool:
        chunk = (
            self.db.query(KnowledgeChunk)
            .filter(
                KnowledgeChunk.id == chunk_id,
                KnowledgeChunk.artisan_id == artisan_id,
            )
            .first()
        )
        if not chunk:
            return False
        self.db.delete(chunk)
        self.db.commit()
        return True
