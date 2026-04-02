-- ArtiBot — Initialisation base de données
-- PostgreSQL 15+ avec pgvector

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Table artisans
CREATE TABLE IF NOT EXISTS artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    clerk_user_id VARCHAR(255) UNIQUE,
    config_json JSONB DEFAULT '{}',
    gmail_token_encrypted TEXT,
    twilio_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artisans_clerk_user_id ON artisans (clerk_user_id);

-- Table knowledge_chunks (RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    source_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
    ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Table prospects
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    project_type VARCHAR(255),
    surface VARCHAR(100),
    location VARCHAR(255),
    budget VARCHAR(100),
    delay VARCHAR(100),
    score VARCHAR(20) DEFAULT 'cold',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    messages_json JSONB DEFAULT '[]',
    bot_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table rapports
CREATE TABLE IF NOT EXISTS rapports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    html_content TEXT NOT NULL,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
