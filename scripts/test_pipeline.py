#!/usr/bin/env python3
"""
ArtiBot — Script de validation Phase 0
======================================
Simule un email entrant, cherche dans une base RAG fictive (sans DB),
génère une réponse via OpenAI GPT-4o et évalue le score prospect.

Usage :
    OPENAI_API_KEY=sk-... python3 scripts/test_pipeline.py
"""

import json
import math
import os
import sys

# ── Fixtures : configuration artisan fictif ─────────────────────────────────

ARTISAN_CONFIG = {
    "name": "Jean-Pierre Moreau",
    "email": "jp.moreau@peinture-moreau.fr",
    "config_json": {
        "metier": "peintre en bâtiment",
        "ville": "Rennes",
        "zone": "Rennes et 30km alentour",
        "tarifs": {
            "peinture_intérieure": "22€/m²",
            "ravalement_façade": "45€/m²",
            "ponçage_parquet": "18€/m²",
        },
        "delais": "3 à 5 semaines selon disponibilité",
        "ton": "professionnel et chaleureux",
        "message_accueil": "Bonjour ! Je suis l'assistant de Jean-Pierre, peintre à Rennes. Comment puis-je vous aider ?",
        "message_threshold": 5,
    },
}

# ── Fixtures : base de connaissances fictive ─────────────────────────────────

KNOWLEDGE_BASE = [
    {
        "content": "Tarifs peinture intérieure : 22€/m² pour 2 couches de peinture, impression incluse. Délais : 1 semaine pour 50m². Déplacement gratuit dans un rayon de 30km autour de Rennes.",
        "source": "tarifs_2024.pdf",
    },
    {
        "content": "Ravalement de façade : 45€/m² incluant nettoyage haute pression, rebouchage fissures, 2 couches de peinture façade. Garantie 10 ans sur les produits utilisés.",
        "source": "tarifs_2024.pdf",
    },
    {
        "content": "Jean-Pierre Moreau, artisan peintre depuis 15 ans à Rennes. Certifié RGE. Assurance décennale souscrite chez Allianz. SIRET : 123 456 789 00012.",
        "source": "presentation.pdf",
    },
    {
        "content": "Zone d'intervention : Rennes et les communes de la métropole (Cesson-Sévigné, Bruz, Chartres-de-Bretagne, Saint-Jacques-de-la-Lande, etc.). En dehors de ce périmètre, frais de déplacement 0,50€/km.",
        "source": "presentation.pdf",
    },
    {
        "content": "Ponçage et vitrification parquet : 18€/m² pour ponçage + 1 couche de vitrificateur. 25€/m² pour ponçage + 2 couches. Délai de séchage : 24h entre chaque couche.",
        "source": "tarifs_2024.pdf",
    },
    {
        "content": "Délais de disponibilité habituels : 3 à 5 semaines pour les travaux intérieurs. En haute saison (avril-septembre), compter 6 à 8 semaines. Travaux urgents possibles sous 1 semaine pour les petites interventions.",
        "source": "faq.pdf",
    },
    {
        "content": "Devis gratuit et sans engagement. Visite sur place obligatoire pour les chantiers > 100m². Pour les petits travaux, envoyez des photos et la surface approximative pour un devis indicatif.",
        "source": "faq.pdf",
    },
]

# ── Fixtures : emails simulés ─────────────────────────────────────────────────

SIMULATED_EMAILS = [
    {
        "scenario": "Première prise de contact vague",
        "sender": "marie.dupont@gmail.com",
        "subject": "Demande de renseignements",
        "content": "Bonjour, je cherche un peintre pour des travaux chez moi. Pouvez-vous m'envoyer vos tarifs ? Merci.",
        "conversation_history": [],
    },
    {
        "scenario": "Prospect avec projet précis (proche qualification hot)",
        "sender": "thomas.bernard@hotmail.fr",
        "subject": "Ravalement façade maison",
        "content": "Bonjour, j'ai une maison à Bruz avec une façade d'environ 120m² à ravaler. J'aimerais faire les travaux avant l'été (juin). Mon budget est autour de 5000-6000€. Êtes-vous disponible ?",
        "conversation_history": [],
    },
    {
        "scenario": "Conversation en cours — 4ème message",
        "sender": "sophie.martin@orange.fr",
        "subject": "Re: Peinture appartement",
        "content": "D'accord merci pour le devis indicatif. On parlerait donc de 3 semaines de travaux pour mon appartement de 75m² à Rennes centre ? Je voudrais commencer mi-mai si possible.",
        "conversation_history": [
            {"from": "prospect", "content": "Bonjour, je voudrais peindre mon appartement."},
            {"from": "bot", "content": "Bonjour ! Je suis l'assistant de Jean-Pierre. Quelle est la surface de votre appartement et quels types de pièces souhaitez-vous peindre ?"},
            {"from": "prospect", "content": "C'est un appartement de 75m² à Rennes centre, je voudrais refaire toutes les pièces."},
            {"from": "bot", "content": "Pour un appartement de 75m², comptez environ 1 650€ (22€/m²). Avez-vous une date souhaitée pour les travaux ?"},
        ],
    },
]


# ── Fonctions utilitaires ────────────────────────────────────────────────────

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def get_embeddings_openai(texts: list[str], api_key: str) -> list[list[float]]:
    """Génère des embeddings via OpenAI text-embedding-3-small."""
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(input=texts, model="text-embedding-3-small")
    return [item.embedding for item in response.data]


def rag_search_in_memory(
    query: str,
    knowledge_base: list[dict],
    embeddings: list[list[float]],
    query_embedding: list[float],
    top_k: int = 3,
) -> list[str]:
    """Recherche par similarité cosinus dans une base en mémoire."""
    scores = [
        (cosine_similarity(query_embedding, emb), kb["content"])
        for emb, kb in zip(embeddings, knowledge_base)
    ]
    scores.sort(key=lambda x: x[0], reverse=True)
    return [content for _, content in scores[:top_k]]


def rag_search_keyword_fallback(query: str, knowledge_base: list[dict], top_k: int = 3) -> list[str]:
    """Fallback keyword search si pas d'API d'embedding disponible."""
    query_words = set(query.lower().split())
    scored = []
    for kb in knowledge_base:
        words = set(kb["content"].lower().split())
        score = len(query_words & words)
        scored.append((score, kb["content"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [content for _, content in scored[:top_k] if content]


def evaluate_qualification_simple(messages: list[dict], prospect_data: dict) -> dict:
    """Évaluation de qualification simplifiée sans DB."""
    filled = [k for k, v in prospect_data.items() if v and v != "null"]
    core = [f for f in ["project_type", "surface", "location"] if prospect_data.get(f)]
    hot = [f for f in ["budget", "delay"] if prospect_data.get(f)]

    score = "cold"
    if len(core) >= 2 and len(hot) >= 1:
        score = "warm"
    if len(core) >= 2 and len(hot) >= 2:
        delay = str(prospect_data.get("delay", "")).lower()
        if any(kw in delay for kw in ["urgent", "mai", "juin", "juillet", "semaine", "mois"]):
            score = "hot"

    should_qualify = len(core) >= 2 or (len(messages) >= 5 and len(core) >= 1)

    return {
        "should_qualify": should_qualify,
        "score": score,
        "filled_fields": filled,
        "core_fields": core,
    }


def print_separator(char="─", width=70):
    print(char * width)


def print_section(title: str):
    print_separator()
    print(f"  {title}")
    print_separator()


# ── Pipeline principal ────────────────────────────────────────────────────────

def run_test_pipeline():
    openai_key = os.environ.get("OPENAI_API_KEY")

    if not openai_key:
        print("❌ ERREUR : Variable OPENAI_API_KEY manquante.")
        print("   Usage : OPENAI_API_KEY=sk-... python3 scripts/test_pipeline.py")
        sys.exit(1)

    print("\n" + "═" * 70)
    print("  ArtiBot — Validation Pipeline Phase 0")
    print("═" * 70)
    print(f"\n  Artisan : {ARTISAN_CONFIG['name']}")
    print(f"  Métier  : {ARTISAN_CONFIG['config_json']['metier']}")
    print(f"  Zone    : {ARTISAN_CONFIG['config_json']['zone']}")

    # ── Étape 1 : Embeddings de la base de connaissances ──────────────────
    print_section("Étape 1 — Indexation de la base de connaissances")

    kb_embeddings = None
    print("  Génération des embeddings (OpenAI text-embedding-3-small)...")
    try:
        kb_texts = [kb["content"] for kb in KNOWLEDGE_BASE]
        kb_embeddings = get_embeddings_openai(kb_texts, openai_key)
        print(f"  ✓ {len(kb_embeddings)} chunks indexés (dim={len(kb_embeddings[0])})")
    except Exception as e:
        print(f"  ⚠ Erreur embeddings : {e}")
        print("  → Fallback sur recherche par mots-clés")
        kb_embeddings = None

    # ── Étape 2 : Test des scénarios ──────────────────────────────────────
    from openai import OpenAI
    gpt = OpenAI(api_key=openai_key)

    for i, scenario in enumerate(SIMULATED_EMAILS, 1):
        print(f"\n{'═' * 70}")
        print(f"  Scénario {i}/{len(SIMULATED_EMAILS)} : {scenario['scenario']}")
        print("═" * 70)

        print(f"\n  De      : {scenario['sender']}")
        print(f"  Sujet   : {scenario['subject']}")
        print(f"  Message : {scenario['content'][:100]}{'...' if len(scenario['content']) > 100 else ''}")

        # Étape 2a : RAG Search
        print_section("Étape 2 — Recherche RAG")
        query = scenario["content"]

        if kb_embeddings:
            try:
                query_embs = get_embeddings_openai([query], openai_key)
                rag_results = rag_search_in_memory(
                    query, KNOWLEDGE_BASE, kb_embeddings, query_embs[0], top_k=3
                )
                print("  Méthode : similarité cosinus (embeddings)")
            except Exception as e:
                print(f"  ⚠ Embeddings query échoué : {e} → fallback mots-clés")
                rag_results = rag_search_keyword_fallback(query, KNOWLEDGE_BASE, top_k=3)
        else:
            rag_results = rag_search_keyword_fallback(query, KNOWLEDGE_BASE, top_k=3)
            print("  Méthode : mots-clés (fallback)")

        print(f"  {len(rag_results)} chunks pertinents trouvés :")
        for j, chunk in enumerate(rag_results, 1):
            print(f"    [{j}] {chunk[:80]}...")

        # Étape 2b : Construction du prompt
        rag_context = "\n---\n".join(rag_results) if rag_results else "Aucune information spécifique disponible."
        config = ARTISAN_CONFIG["config_json"]

        system_prompt = f"""Tu es l'assistant de {ARTISAN_CONFIG['name']}, {config['metier']} basé à {config['ville']}.

## Informations métier
- Tarifs : {json.dumps(config['tarifs'], ensure_ascii=False)}
- Zone d'intervention : {config['zone']}
- Délais : {config['delais']}

## Base de connaissances
{rag_context}

## Règles
1. Signe toujours 'Jean-Pierre'
2. Ne donne jamais de prix ferme sans visite préalable
3. Ne mentionne jamais ArtiBot
4. Si tu ne sais pas, dis que Jean-Pierre va rappeler sous 24h

## Objectif
Collecte progressivement : type de travaux, surface, adresse, budget, délai, coordonnées.

## Format de réponse obligatoire (JSON uniquement)
{{
  "response": "le message à envoyer au prospect",
  "prospect_data": {{
    "name": null,
    "phone": null,
    "email": null,
    "project_type": null,
    "surface": null,
    "location": null,
    "budget": null,
    "delay": null
  }},
  "score": "cold|warm|hot",
  "score_reason": "explication courte"
}}"""

        # Construction des messages avec historique
        messages_api = []
        for msg in scenario["conversation_history"]:
            role = "user" if msg["from"] == "prospect" else "assistant"
            if role == "assistant":
                try:
                    parsed = json.loads(msg["content"])
                    content = parsed.get("response", msg["content"])
                except Exception:
                    content = msg["content"]
            else:
                content = msg["content"]
            messages_api.append({"role": role, "content": content})

        messages_api.append({"role": "user", "content": scenario["content"]})

        # Étape 2c : Appel GPT-4o
        print_section("Étape 3 — Génération réponse GPT-4o")
        print("  Appel en cours...")

        try:
            messages_with_system = [{"role": "system", "content": system_prompt}] + messages_api
            response = gpt.chat.completions.create(
                model="gpt-4o",
                messages=messages_with_system,
                max_tokens=1024,
                temperature=0.4,
                response_format={"type": "json_object"},
            )

            raw_text = response.choices[0].message.content.strip()
            result = json.loads(raw_text)

            print(f"\n  Réponse générée :")
            print(f"  {'─' * 60}")
            print(f"  {result['response']}")
            print(f"  {'─' * 60}")

            # Étape 2d : Qualification
            print_section("Étape 4 — Évaluation qualification")

            all_messages = list(scenario["conversation_history"]) + [
                {"from": "prospect", "content": scenario["content"]},
                {"from": "bot", "content": result["response"]},
            ]

            prospect_data = result.get("prospect_data", {})
            qual = evaluate_qualification_simple(all_messages, prospect_data)

            score_icons = {"cold": "❄", "warm": "🌡", "hot": "🔥"}
            score = result.get("score", qual["score"])
            print(f"  Score prospect : {score_icons.get(score, '?')} {score.upper()}")
            print(f"  Raison        : {result.get('score_reason', 'N/A')}")
            print(f"  Champs remplis: {qual['filled_fields']}")
            print(f"  Qualification : {'✓ OUI — rapport à envoyer' if qual['should_qualify'] else '✗ Non encore'}")

            # Tokens utilisés
            usage = response.usage
            print(f"\n  Tokens utilisés : {usage.prompt_tokens} in / {usage.completion_tokens} out")

        except json.JSONDecodeError as e:
            print(f"  ⚠ Erreur parsing JSON GPT : {e}")
            print(f"  Réponse brute : {raw_text[:200]}...")
        except Exception as e:
            print(f"  ❌ Erreur OpenAI API : {e}")

    # ── Résumé ──────────────────────────────────────────────────────────────
    print(f"\n{'═' * 70}")
    print("  Validation Phase 0 terminée")
    print("═" * 70)
    print("""
  Résultats attendus pour go/no-go :
  ✓ GPT-4o répond correctement aux questions métier (tarifs, zone, délais)
  ✓ Le RAG injecte les bonnes informations dans le contexte
  ✓ Le scoring prospect fonctionne (cold/warm/hot)
  ✓ Le JSON est correctement parsé (garanti par response_format json_object)

  Prochaine étape :
  → Phase 1 : Intégration FastAPI + PostgreSQL + pgvector
  → Phase 2 : Canal Email Gmail OAuth + Google Pub/Sub
""")


if __name__ == "__main__":
    run_test_pipeline()
