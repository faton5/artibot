# ArtiBot — Suivi du projet

> Dernière mise à jour : 2026-04-01
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
| Frontend | Next.js 14 + Tailwind + shadcn/ui |
| Hébergement | VPS Docker Compose + Nginx |

---

## Légende
- ✅ Fait — code écrit, fichier créé
- 🔧 Partiel — structure en place, à compléter/tester
- ⏳ À faire — pas encore commencé
- ❌ Hors scope MVP — planifié pour une phase ultérieure

---

## Phase 0 — Fondations (S1-S2)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Structure monorepo | ✅ | `backend/`, `frontend/`, `nginx/`, `scripts/` |
| Config Pydantic Settings | ✅ | `backend/config.py` |
| Connexion DB SQLAlchemy | ✅ | `backend/database.py` |
| Modèles SQLAlchemy (Artisan, Prospect, Conversation, KnowledgeChunk, Rapport) | ✅ | `backend/models/database.py` |
| Migration SQL initiale (pgvector, index ivfflat) | ✅ | `backend/migrations/init.sql` |
| Pipeline RAG (chunking + embeddings OpenAI + recherche cosinus pgvector) | ✅ | `backend/services/rag.py` |
| Script de validation Phase 0 (sans DB ni OAuth) | ✅ | `scripts/test_pipeline.py` |
| **Tester le script** (`OPENAI_API_KEY=sk-... python3 scripts/test_pipeline.py`) | ⏳ | — |
| **Créer `.gitignore`** | ⏳ | `.gitignore` |
| **Initialiser git** (`git init`) | ⏳ | — |

---

## Phase 1 — Moteur IA (S3-S4)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Intégration OpenAI GPT-4o | ✅ | `backend/services/llm.py` |
| Prompt système dynamique (identité artisan + RAG) | ✅ | `backend/services/llm.py` |
| JSON garanti via `response_format=json_object` | ✅ | `backend/services/llm.py` |
| Génération rapport HTML via GPT-4o-mini | ✅ | `backend/services/llm.py` |
| Logique de qualification (Condition A : nb messages, Condition B : champs) | ✅ | `backend/services/qualification.py` |
| Scoring prospect cold/warm/hot | ✅ | `backend/services/qualification.py` |
| Merge données prospect entre messages | ✅ | `backend/services/qualification.py` |
| **Tests unitaires LLM + qualification** | ⏳ | `backend/tests/` |
| **Affiner le prompt avec de vrais artisans pilotes** | ⏳ | `backend/services/llm.py` |

---

## Phase 2 — Canal Email Gmail OAuth (S5-S6)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Abstraction BaseChannel | ✅ | `backend/services/channels/base.py` |
| Gmail OAuth 2.0 (connect + callback + token chiffré Fernet) | ✅ | `backend/services/channels/gmail.py`, `backend/api/routes/artisan.py` |
| Chiffrement tokens OAuth avec Fernet | ✅ | `backend/services/channels/gmail.py` |
| Réception webhook Google Pub/Sub | ✅ | `backend/api/routes/webhook.py` |
| Envoi réponse via Gmail API | ✅ | `backend/services/channels/gmail.py` |
| Mark as read | ✅ | `backend/services/channels/gmail.py` |
| Pipeline complet (Pub/Sub → RAG → GPT-4o → qualification → rapport) | ✅ | `backend/api/routes/webhook.py` |
| Envoi rapport qualification via Resend | ✅ | `backend/services/email_service.py` |
| **Créer projet Google Cloud** | ⏳ | console.cloud.google.com |
| **Activer Gmail API + Pub/Sub API** dans le projet | ⏳ | console.cloud.google.com |
| **Créer credentials OAuth 2.0** (client_id + client_secret) | ⏳ | console.cloud.google.com → APIs & Services → Credentials |
| **Créer topic Pub/Sub** et subscription avec l'URL du webhook | ⏳ | console.cloud.google.com → Pub/Sub |
| **Tester le flux email end-to-end** | ⏳ | — |

---

## Phase 3 — Interface Admin Next.js (S7-S9)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Structure Next.js 14 App Router | ✅ | `frontend/app/` |
| Configuration Tailwind CSS | ✅ | `frontend/tailwind.config.ts` |
| Navbar / layout global | ✅ | `frontend/components/Navbar.tsx` |
| Client API TypeScript | ✅ | `frontend/lib/api.ts` |
| Types TypeScript partagés | ✅ | `frontend/types/index.ts` |
| Page Onboarding (wizard 4 étapes) | ✅ | `frontend/app/onboarding/page.tsx` |
| Page Dashboard (liste conversations filtrée + recherche) | ✅ | `frontend/app/dashboard/page.tsx` |
| Page Conversation (vue style iMessage) | ✅ | `frontend/app/dashboard/[id]/page.tsx` |
| Composant ConversationView (bulles, bot/artisan/prospect) | ✅ | `frontend/components/ConversationView.tsx` |
| Sidebar prospect (score temps réel, champs) | ✅ | `frontend/components/ProspectSidebar.tsx` |
| Bouton "Reprendre la main" / "Réactiver le bot" | ✅ | `frontend/components/ConversationView.tsx` |
| Réponse manuelle artisan depuis le dashboard | ✅ | `frontend/components/ConversationView.tsx` |
| Page Knowledge (upload PDF + Q&A manuel) | ✅ | `frontend/app/knowledge/page.tsx` |
| Page Settings (Gmail OAuth + config bot) | ✅ | `frontend/app/settings/page.tsx` |
| Page Stats (KPIs + distribution canaux + scores) | ✅ | `frontend/app/stats/page.tsx` |
| **`npm install`** dans `frontend/` | ⏳ | `frontend/` |
| **Créer compte Clerk** et récupérer les clés | ⏳ | clerk.com |
| **Ajouter pages Clerk** (`/sign-in`, `/sign-up`, `middleware.ts`) | ⏳ | `frontend/app/sign-in/`, `frontend/app/sign-up/` |
| **Installer composants shadcn/ui** (`npx shadcn-ui@latest init`) | ⏳ | `frontend/components/ui/` |
| **Lier ARTISAN_ID à l'utilisateur Clerk** (multi-artisan) | ⏳ | — |

---

## Phase 4 — Canal SMS Twilio (S10)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Implémentation SMSChannel | ✅ | `backend/services/channels/sms.py` |
| Webhook POST Twilio | ✅ | `backend/api/routes/webhook.py` |
| Achat numéro Twilio à l'onboarding | ✅ | `backend/services/channels/sms.py` |
| **Créer compte Twilio** + récupérer SID et AUTH_TOKEN | ⏳ | twilio.com |
| **Configurer le webhook Twilio** dans la console (URL `/api/webhook/sms`) | ⏳ | console.twilio.com |
| **Tester le flux SMS end-to-end** | ⏳ | — |

---

## Phase 5 — Déploiement VPS + Docker (S11-S12)

| Tâche | Statut | Fichier(s) |
|-------|--------|-----------|
| Docker Compose (db + backend + frontend + nginx + certbot) | ✅ | `docker-compose.yml` |
| Dockerfile backend Python | ✅ | `backend/Dockerfile` |
| Dockerfile frontend Next.js | ✅ | `frontend/Dockerfile` |
| Nginx reverse proxy (artibot.fr + api.artibot.fr) | ✅ | `nginx/nginx.conf` |
| `.env.example` documenté | ✅ | `.env.example` |
| **Créer le fichier `.env`** à partir de `.env.example` | ⏳ | `.env` |
| **Générer la clé Fernet** (voir commande ci-dessous) | ⏳ | `.env` → `FERNET_KEY` |
| **Provisionner le VPS** (Ubuntu 22+, Docker, Docker Compose v2) | ⏳ | — |
| **Configurer les DNS** (A record → IP VPS) | ⏳ | Registrar DNS |
| **Obtenir certificats SSL** Let's Encrypt | ⏳ | `docker compose --profile ssl up certbot` |
| **Tester avec 3-5 artisans pilotes** | ⏳ | — |

---

## Phase 6 — Widget Web (S13-S14) ❌ Non commencé

- Widget iframe embarquable sur site artisan
- Page chat publique `/chat/[artisan_id]`
- Script JS à copier-coller

---

## Phase 7 — WhatsApp (S15+) ❌ Non commencé

- WhatsApp Cloud API Meta
- Validation Business Meta (délai 4-8 semaines)

---

## Prochaines étapes concrètes — Dans l'ordre

### Étape 1 — Tester le pipeline maintenant (15 min)

```bash
cd /home/faton/Documents/Dev/artibot

# Installer openai en local (si pas dans un venv)
pip install openai langchain-text-splitters --break-system-packages
# ou via venv :
python3 -m venv .venv && source .venv/bin/activate && pip install openai langchain-text-splitters

# Lancer le test
OPENAI_API_KEY=sk-... python3 scripts/test_pipeline.py
```

**Résultat attendu** : 3 scénarios testés, réponses en français, scores cold/warm/hot corrects.

---

### Étape 2 — Créer le `.env` (5 min)

```bash
cp .env.example .env
# Remplir au minimum :
#   OPENAI_API_KEY=sk-...
#   DB_PASSWORD=un_mot_de_passe_fort
#   FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
```

---

### Étape 3 — Lancer le backend en local (10 min)

```bash
# Installer Docker Desktop si pas déjà fait
docker compose up db backend

# Vérifier
curl http://localhost:8000/health
# → {"status": "ok", "service": "artibot-backend"}

# Swagger UI
# Ouvrir http://localhost:8000/docs
```

---

### Étape 4 — Lancer le frontend en local (10 min)

```bash
cd frontend
npm install
# Créer frontend/.env.local :
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_ARTISAN_ID=<UUID créé via POST /api/artisans>
npm run dev
# Ouvrir http://localhost:3000
```

---

### Étape 5 — Config Google Cloud pour Gmail (45 min)

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un projet "ArtiBot"
3. Activer **Gmail API** + **Cloud Pub/Sub API**
4. Créer des **Credentials OAuth 2.0** (type : Application Web)
   - URI de redirection autorisée : `http://localhost:8000/api/artisans/{id}/gmail/callback`
5. Copier `client_id` et `client_secret` dans `.env`
6. Créer un **topic Pub/Sub** nommé `artibot-gmail`
7. Créer une **subscription** Push vers `http://ton-domaine/api/webhook/gmail`
8. Remplir `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_PUBSUB_PROJECT_ID` dans `.env`

---

### Étape 6 — Config Clerk pour l'auth (20 min)

1. Créer un compte sur [clerk.com](https://clerk.com)
2. Créer une application "ArtiBot"
3. Copier `CLERK_SECRET_KEY` et `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` dans `.env`
4. Créer `frontend/app/sign-in/[[...sign-in]]/page.tsx` et `sign-up`
5. Créer `frontend/middleware.ts` pour protéger les routes

---

### Étape 7 — Config Resend pour les emails (5 min)

1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier le domaine `artibot.fr` (ou utiliser le sandbox pour tester)
3. Copier `RESEND_API_KEY` dans `.env`

---

## Commandes utiles

```bash
# Générer une clé Fernet
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Lancer tous les services
docker compose up

# Logs backend
docker compose logs -f backend

# Reset base de données
docker compose down -v && docker compose up db backend

# Accéder à PostgreSQL
docker compose exec db psql -U artibot -d artibot
```

---

## Récapitulatif global

| Phase | Statut | Bloquant ? |
|-------|--------|-----------|
| 0 — Fondations | ✅ Code fait | Tester `test_pipeline.py` |
| 1 — Moteur IA | ✅ Code fait | Affiner prompt |
| 2 — Canal Email | 🔧 Code fait | Config Google Cloud |
| 3 — Interface Admin | 🔧 Code fait | `npm install` + Clerk + shadcn |
| 4 — SMS Twilio | 🔧 Code fait | Config Twilio |
| 5 — Déploiement | 🔧 Docker prêt | VPS + DNS + SSL |
| 6 — Widget Web | ❌ | Phase 6 |
| 7 — WhatsApp | ❌ | Phase 7 |
