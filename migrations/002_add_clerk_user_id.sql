-- Migration 002 : Ajout clerk_user_id sur la table artisans
-- À exécuter une fois le VPS déployé : psql $DATABASE_URL < migrations/002_add_clerk_user_id.sql

ALTER TABLE artisans
  ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_artisans_clerk_user_id ON artisans (clerk_user_id);
