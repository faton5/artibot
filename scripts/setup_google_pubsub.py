#!/usr/bin/env python3
"""
ArtiBot — Configuration Google Cloud Pub/Sub pour Gmail
=========================================================
Ce script crée le topic Pub/Sub et configure la subscription push
vers le webhook ArtiBot.

Prérequis :
  1. pip install google-cloud-pubsub
  2. gcloud auth application-default login  (ou GOOGLE_APPLICATION_CREDENTIALS)
  3. Le projet Google Cloud doit avoir Pub/Sub API activée
  4. Une URL publique HTTPS (VPS déployé ou ngrok)

Usage :
    WEBHOOK_URL=https://api.artibot.fr python3 scripts/setup_google_pubsub.py
"""

import os
import sys

PROJECT_ID = os.environ.get("GOOGLE_PUBSUB_PROJECT_ID", "artibot")
TOPIC_NAME = "artibot-gmail"
SUBSCRIPTION_NAME = "artibot-gmail-push"
WEBHOOK_URL = os.environ.get("WEBHOOK_URL", "")

GMAIL_PUBSUB_SA = "serviceAccount:gmail-api-push@system.gserviceaccount.com"


def main():
    if not WEBHOOK_URL:
        print("❌ ERREUR : Variable WEBHOOK_URL manquante.")
        print("   Usage : WEBHOOK_URL=https://api.artibot.fr python3 scripts/setup_google_pubsub.py")
        sys.exit(1)

    push_endpoint = f"{WEBHOOK_URL.rstrip('/')}/api/webhook/gmail"
    topic_path = f"projects/{PROJECT_ID}/topics/{TOPIC_NAME}"

    print(f"\n{'═' * 60}")
    print("  ArtiBot — Setup Google Cloud Pub/Sub")
    print("═" * 60)
    print(f"  Projet        : {PROJECT_ID}")
    print(f"  Topic         : {TOPIC_NAME}")
    print(f"  Subscription  : {SUBSCRIPTION_NAME}")
    print(f"  Push endpoint : {push_endpoint}")
    print()

    try:
        from google.cloud import pubsub_v1
        from google.api_core.exceptions import AlreadyExists, NotFound
    except ImportError:
        print("❌ google-cloud-pubsub non installé.")
        print("   pip install google-cloud-pubsub")
        sys.exit(1)

    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()

    # ── Étape 1 : Créer le topic ─────────────────────────────────────────────
    print("  [1/3] Création du topic...")
    try:
        topic = publisher.create_topic(request={"name": topic_path})
        print(f"  ✓ Topic créé : {topic.name}")
    except AlreadyExists:
        print(f"  ✓ Topic déjà existant : {topic_path}")
    except Exception as e:
        print(f"  ❌ Erreur création topic : {e}")
        sys.exit(1)

    # ── Étape 2 : Donner permission à Gmail de publier ───────────────────────
    print("  [2/3] Permission gmail-api-push → topic...")
    try:
        policy = publisher.get_iam_policy(request={"resource": topic_path})
        binding = next(
            (b for b in policy.bindings if b.role == "roles/pubsub.publisher"),
            None,
        )
        if binding is None:
            from google.iam.v1 import policy_pb2
            policy.bindings.add(role="roles/pubsub.publisher", members=[GMAIL_PUBSUB_SA])
        elif GMAIL_PUBSUB_SA not in binding.members:
            binding.members.append(GMAIL_PUBSUB_SA)
        else:
            print(f"  ✓ Permission déjà accordée")
            binding = None  # skip set

        if binding is not None:
            publisher.set_iam_policy(request={"resource": topic_path, "policy": policy})
            print(f"  ✓ Permission accordée à {GMAIL_PUBSUB_SA}")
    except Exception as e:
        print(f"  ❌ Erreur IAM : {e}")

    # ── Étape 3 : Créer la subscription push ────────────────────────────────
    print("  [3/3] Création subscription push...")
    subscription_path = f"projects/{PROJECT_ID}/subscriptions/{SUBSCRIPTION_NAME}"
    try:
        sub = subscriber.create_subscription(
            request={
                "name": subscription_path,
                "topic": topic_path,
                "push_config": {"push_endpoint": push_endpoint},
                "ack_deadline_seconds": 30,
            }
        )
        print(f"  ✓ Subscription créée : {sub.name}")
    except AlreadyExists:
        # Mettre à jour l'endpoint
        subscriber.modify_push_config(
            request={
                "subscription": subscription_path,
                "push_config": {"push_endpoint": push_endpoint},
            }
        )
        print(f"  ✓ Subscription mise à jour avec le nouveau endpoint")
    except Exception as e:
        print(f"  ❌ Erreur subscription : {e}")
        sys.exit(1)

    print(f"\n{'═' * 60}")
    print("  ✅ Pub/Sub configuré avec succès !")
    print(f"\n  Prochaine étape : connecter Gmail via le dashboard")
    print(f"  → http://localhost:3000/settings")
    print(f"  → Cliquer 'Connecter Gmail'")
    print()


if __name__ == "__main__":
    main()
