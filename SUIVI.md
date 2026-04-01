# ArtiBot — Suivi du projet

> Dernière mise à jour : 2026-04-01 (session 2)
> Version CDC : 2.0 — Mars 2026

---

## Stack technique retenue

| Couche | Technologie |
|--------|-------------|
| LLM | **OpenAI GPT-4o** (`gpt-4o`) |
| LLM rapide (rapports) | **OpenAI GPT-4o-mini** (`gpt-4o-mini`) |
| Embeddings RAG | **OpenAI text-embedding-3-small** (dim 1536) |
| Backend | Python 3.11 + FastAPI |
| Base de données | PostgreSQL 15 + pgvector |
| Email MVP | Gmail OAuth 2.0 + Google Pub/Sub |
| SMS | Twilio |
| Emails transac. | Resend |
| Auth | Clerk |
| Frontend | Next.js 14 + Tailwind |
| Hébergement | VPS Docker Compose + Nginx |

---

## Légende
- ✅ Fait et fonctionnel
- 🔧 Code écrit, config externe manquante
- ⏳ À faire
- ❌ Hors scope MVP

---

## Phase 0 — Fondations

| Tâche | Statut |
|-------|--------|
| Structure monorepo | ✅ |
| Config Pydantic Settings | ✅ |
| Connexion DB SQLAlchemy | ✅ |
| Modèles SQLAlchemy (5 tables) | ✅ |
| Migration SQL initiale + pgvector | ✅ |
| Pipeline RAG (chunking + embeddings + cosinus) | ✅ |
| Script de validation Phase 0 | ✅ |
| `.gitignore` + git init | ✅ |
| Push GitHub | ✅ |
| Docker Compose lancé (db + backend) | ✅ |
| Artisan créé en base (UUID récupéré) | ✅ |
| **Tester `scripts/test_pipeline.py`** | ✅ |

---

## Phase 1 — Moteur IA

| Tâche | Statut |
|-------|--------|
| Intégration OpenAI GPT-4o | ✅ |
| Prompt système dynamique (artisan + RAG) | ✅ |
| JSON garanti (`response_format=json_object`) | ✅ |
| Génération rapport HTML via GPT-4o-mini | ✅ |
| Logique qualification (Condition A + B) | ✅ |
| Scoring cold/warm/hot | ✅ |
| Merge données prospect | ✅ |
| **Tests unitaires** | ⏳ |
| **Affiner prompt avec artisans pilotes** | ⏳ |

---

## Phase 2 — Canal Email Gmail OAuth

| Tâche | Statut |
|-------|--------|
| BaseChannel abstraction | ✅ |
| Gmail OAuth 2.0 (connect + callback) | ✅ |
| Chiffrement tokens Fernet | ✅ |
| Webhook Google Pub/Sub | ✅ |
| Envoi réponse Gmail API | ✅ |
| Pipeline complet webhook → RAG → GPT-4o → rapport | ✅ |
| Envoi rapport Resend | ✅ |
| **Créer projet Google Cloud** | ✅ |
| **Activer Gmail API + Pub/Sub API** | 🔧 (à vérifier console) |
| **Créer credentials OAuth 2.0** | ✅ |
| **Ajouter redirect URI localhost dans console** | ⏳ |
| **Créer topic Pub/Sub + subscription webhook** | ⏳ (script prêt, besoin URL publique) |
| **Tester flux email end-to-end** | ⏳ |

---

## Phase 3 — Interface Admin Next.js

| Tâche | Statut |
|-------|--------|
| Structure Next.js 14 App Router | ✅ |
| Tailwind CSS | ✅ |
| Navbar / layout | ✅ |
| Client API TypeScript | ✅ |
| Types TypeScript | ✅ |
| Page Onboarding (wizard 4 étapes) | ✅ |
| Page Dashboard (liste + recherche + filtres) | ✅ |
| Page Conversation (vue iMessage) | ✅ |
| ConversationView (bulles bot/artisan/prospect) | ✅ |
| Sidebar prospect (score temps réel) | ✅ |
| Bouton "Reprendre la main" / "Réactiver le bot" | ✅ |
| Réponse manuelle artisan | ✅ |
| Page Knowledge (upload PDF + Q&A) | ✅ |
| Page Settings (Gmail OAuth + config bot) | ✅ |
| Bug infinite re-render settings corrigé | ✅ |
| Page Stats (KPIs) | ✅ |
| `npm install` + `npm run dev` | ✅ |
| `.env.local` frontend créé | ✅ |
| Page `/sign-in` Clerk | ✅ |
| Page `/sign-up` Clerk | ✅ |
| `middleware.ts` (routes protégées) | ✅ |
| Dashboard visible et fonctionnel en local | ✅ |
| **Installer composants shadcn/ui** | ⏳ |
| **Lier ARTISAN_ID à l'utilisateur Clerk** | ⏳ |

---

## Phase 4 — Canal SMS Twilio

| Tâche | Statut |
|-------|--------|
| SMSChannel implémenté | ✅ |
| Webhook POST Twilio | ✅ |
| Achat numéro Twilio (onboarding) | ✅ |
| **Créer compte Twilio** | ✅ |
| **Acheter numéro français** | ⏳ (besoin URL publique) |
| **Tester flux SMS end-to-end** | ⏳ |

---

## Phase 5 — Déploiement VPS + Docker

| Tâche | Statut |
|-------|--------|
| Docker Compose complet | ✅ |
| Dockerfile backend | ✅ |
| Dockerfile frontend | ✅ |
| Nginx reverse proxy | ✅ |
| `.env.example` documenté | ✅ |
| `.env` créé et rempli | ✅ |
| Docker lancé en local (db + backend) | ✅ |
| **Provisionner VPS** (Ubuntu 22+, Docker) | ⏳ |
| **Configurer DNS** (A record → IP VPS) | ⏳ |
| **Certificats SSL** Let's Encrypt | ⏳ |
| **Déployer sur VPS** | ⏳ |
| **Tester avec 3-5 artisans pilotes** | ⏳ |

---

## Phase 6 — Widget Web ❌ Non commencé

## Phase 7 — WhatsApp ❌ Non commencé

---

## Récapitulatif global

| Phase | Statut | Prochaine action |
|-------|--------|-----------------|
| 0 — Fondations | ✅ Fonctionnel | — |
| 1 — Moteur IA | ✅ Testé et validé | Affiner prompt |
| 2 — Canal Email | 🔧 OAuth OK, Pub/Sub en attente | URL publique (VPS/ngrok) |
| 3 — Interface Admin | ✅ Fonctionnel en local | shadcn/ui + lier Clerk |
| 4 — SMS Twilio | 🔧 Compte OK, numéro en attente | URL publique (VPS/ngrok) |
| 5 — Déploiement | 🔧 Docker OK en local | VPS + DNS + SSL |
| 6 — Widget Web | ❌ | — |
| 7 — WhatsApp | ❌ | — |

---

## Ce qui reste à faire — Actions prioritaires

### 1. ✅ Moteur IA validé
3 scénarios testés : cold/warm/hot OK, RAG cosinus OK, JSON garanti.

### 2. Google Cloud — 3 étapes manuelles (console.cloud.google.com)
**Projet `artibot` déjà créé, credentials OAuth en place.**

a) Activer les APIs (si pas encore fait) :
   - `console.cloud.google.com/apis/library` → chercher "Gmail API" → Activer
   - Chercher "Cloud Pub/Sub API" → Activer

b) Ajouter le redirect URI dans les credentials OAuth :
   - `console.cloud.google.com/apis/credentials` → Modifier l'OAuth 2.0 Client
   - Ajouter : `http://localhost:8000/api/artisans/50720128-b825-42c5-9cbb-0573ee40f8ad/gmail/callback`
   - (En prod) Ajouter aussi : `https://api.artibot.fr/api/artisans/{artisan_id}/gmail/callback`

c) Une fois le VPS déployé, lancer le script Pub/Sub :
```bash
pip install google-cloud-pubsub
gcloud auth application-default login
WEBHOOK_URL=https://api.artibot.fr python3 scripts/setup_google_pubsub.py
```

### 3. ✅ Twilio configuré
Compte actif. Pour acheter un numéro + configurer webhook :
```bash
# Après déploiement VPS, ajouter dans .env :
APP_BASE_URL=https://api.artibot.fr
# Puis acheter via l'onboarding artisan ou :
python3 -c "
import asyncio
from backend.services.channels.sms import SMSChannel
print(asyncio.run(SMSChannel.purchase_number('75')))
"
```

### 4. ✅ Resend configuré
En dev : `RESEND_FROM_EMAIL=onboarding@resend.dev` (pas de vérification DNS)
En prod : Ajouter `artibot.fr` dans resend.com/domains → copier les DNS records → mettre `RESEND_FROM_EMAIL=rapports@artibot.fr`

### 5. Déployer sur VPS
- Provisionner Ubuntu 22+ avec Docker
- Configurer DNS → déployer avec `docker compose up -d`
- SSL via Certbot
- Puis lancer le script Pub/Sub + acheter numéro Twilio
