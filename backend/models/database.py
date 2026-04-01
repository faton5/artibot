import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from backend.database import Base


class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    clerk_user_id = Column(String(255), nullable=True, unique=True, index=True)
    config_json = Column(JSONB, default={})
    gmail_token_encrypted = Column(Text, nullable=True)
    twilio_number = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    knowledge_chunks = relationship("KnowledgeChunk", back_populates="artisan", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="artisan", cascade="all, delete-orphan")
    prospects = relationship("Prospect", back_populates="artisan", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("artisans.id"), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=True)
    source_file = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("Artisan", back_populates="knowledge_chunks")


class Prospect(Base):
    __tablename__ = "prospects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("artisans.id"), nullable=False)
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    project_type = Column(String(255), nullable=True)
    surface = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    budget = Column(String(100), nullable=True)
    delay = Column(String(100), nullable=True)
    score = Column(String(20), default="cold")  # cold / warm / hot
    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("Artisan", back_populates="prospects")
    conversations = relationship("Conversation", back_populates="prospect", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artisan_id = Column(UUID(as_uuid=True), ForeignKey("artisans.id"), nullable=False)
    prospect_id = Column(UUID(as_uuid=True), ForeignKey("prospects.id"), nullable=True)
    channel = Column(String(20), nullable=False)  # email / sms / whatsapp
    status = Column(String(20), default="active")  # active / qualified / closed / escalated
    messages_json = Column(JSONB, default=[])
    bot_active = Column(Integer, default=1)  # 1 = bot actif, 0 = artisan a repris la main
    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("Artisan", back_populates="conversations")
    prospect = relationship("Prospect", back_populates="conversations")
    rapport = relationship("Rapport", back_populates="conversation", uselist=False, cascade="all, delete-orphan")


class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    html_content = Column(Text, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="rapport")
