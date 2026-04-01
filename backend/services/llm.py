import json
import logging

from openai import OpenAI

from backend.config import settings

logger = logging.getLogger(__name__)

MODEL = "gpt-4o"           # Modèle principal
MODEL_FAST = "gpt-4o-mini" # Modèle pour les tâches rapides (rapport HTML)

SYSTEM_PROMPT_TEMPLATE = """Tu es l'assistant de {artisan_name}, {metier} basé à {ville}.

## Informations métier
- Tarifs : {tarifs}
- Zone d'intervention : {zone}
- Délais habituels : {delais}
- Message d'accueil personnalisé : {message_accueil}

## Ton et style
Réponds de façon {ton}. Signe toujours '{artisan_prenom}'.

## Base de connaissances
{rag_context}

## Règles importantes
1. Si tu ne connais pas la réponse, dis que {artisan_prenom} va rappeler sous 24h.
2. Ne donne jamais de prix ferme sans visite ou métré préalable.
3. Ne mentionne jamais le nom ArtiBot. Tu es l'assistant de {artisan_name}.
4. Sois concis et chaleureux. Adapte-toi au ton du prospect.
5. Message RGPD au premier échange : informe discrètement que la conversation est traitée de façon confidentielle.

## Objectif de qualification
Collecte progressivement ces informations au fil de la conversation :
- Type de travaux / projet
- Surface ou quantité
- Adresse ou commune
- Budget estimé
- Délai souhaité
- Coordonnées (nom, téléphone ou email)

Ne pose pas toutes les questions en même temps. Sois naturel.

## Format de réponse
Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "response": "le message à envoyer au prospect",
  "prospect_data": {
    "name": null,
    "phone": null,
    "email": null,
    "project_type": null,
    "surface": null,
    "location": null,
    "budget": null,
    "delay": null
  },
  "score": "cold",
  "score_reason": "explication courte du score"
}

Valeurs possibles pour score :
- cold : demande vague, pas de projet défini
- warm : projet identifié mais délai/budget flous
- hot : projet précis, délai court (< 1 mois), budget mentionné
"""


class LLMService:
    """Service d'intégration OpenAI GPT — génération de réponses et scoring."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def build_system_prompt(self, artisan_config: dict, rag_chunks: list[str]) -> str:
        config = artisan_config.get("config_json", {})

        if rag_chunks:
            rag_context = "Voici des informations de ta base de connaissances :\n\n"
            rag_context += "\n---\n".join(rag_chunks)
        else:
            rag_context = "Aucune information spécifique disponible pour cette question."

        return SYSTEM_PROMPT_TEMPLATE.format(
            artisan_name=artisan_config.get("name", "l'artisan"),
            artisan_prenom=artisan_config.get("name", "l'artisan").split()[0],
            metier=config.get("metier", "artisan du bâtiment"),
            ville=config.get("ville", "France"),
            tarifs=json.dumps(config.get("tarifs", {}), ensure_ascii=False) or "Sur devis",
            zone=config.get("zone", "Région parisienne"),
            delais=config.get("delais", "2 à 4 semaines selon disponibilité"),
            message_accueil=config.get("message_accueil", f"Bonjour ! Je suis l'assistant de {artisan_config.get('name', 'l artisan')}. Comment puis-je vous aider ?"),
            ton=config.get("ton", "professionnel et chaleureux"),
            rag_context=rag_context,
        )

    def _build_messages(self, system_prompt: str, conversation_history: list[dict], new_message: str) -> list[dict]:
        messages = [{"role": "system", "content": system_prompt}]

        for msg in conversation_history[-10:]:
            role = "user" if msg.get("from") == "prospect" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

        messages.append({"role": "user", "content": new_message})
        return messages

    async def generate_response(
        self,
        artisan_config: dict,
        conversation_history: list[dict],
        prospect_message: str,
        rag_chunks: list[str],
    ) -> dict:
        """
        Génère une réponse GPT-4o avec scoring prospect.
        Retourne : {"response": str, "prospect_data": dict, "score": str, "score_reason": str}
        """
        system_prompt = self.build_system_prompt(artisan_config, rag_chunks)
        messages = self._build_messages(system_prompt, conversation_history, prospect_message)

        try:
            response = self.client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=1024,
                temperature=0.4,
                response_format={"type": "json_object"},  # Garantit du JSON valide
            )

            raw_text = response.choices[0].message.content.strip()
            result = json.loads(raw_text)
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Erreur parsing JSON GPT : {e}\nRéponse : {raw_text}")
            return {
                "response": raw_text,
                "prospect_data": {},
                "score": "cold",
                "score_reason": "Erreur de parsing",
            }
        except Exception as e:
            logger.error(f"Erreur OpenAI API : {e}")
            raise

    async def generate_report_html(
        self,
        artisan_config: dict,
        prospect_data: dict,
        conversation_history: list[dict],
        score: str,
        dashboard_url: str,
    ) -> str:
        """Génère le HTML du rapport de qualification via GPT-4o-mini."""
        artisan_name = artisan_config.get("name", "l'artisan")

        last_messages = conversation_history[-5:]
        conversation_excerpt = "\n".join(
            f"{'Prospect' if m.get('from') == 'prospect' else 'Bot'}: {m.get('content', '')}"
            for m in last_messages
        )

        score_label = {"cold": "Froid", "warm": "Tiède", "hot": "Chaud"}.get(score, score)
        score_color = {"cold": "#64748b", "warm": "#f59e0b", "hot": "#ef4444"}.get(score, "#64748b")

        prompt = f"""Génère un email HTML professionnel de rapport de qualification pour {artisan_name}.

Données du prospect :
{json.dumps(prospect_data, ensure_ascii=False, indent=2)}

Score de maturité : {score_label}

Derniers messages de la conversation :
{conversation_excerpt}

Lien dashboard : {dashboard_url}

L'email HTML doit être propre, lisible, avec :
- Un header ArtiBot (couleur #2563eb)
- Les coordonnées du prospect
- La nature des travaux, surface, localisation, budget, délai
- Le score en badge coloré ({score_color})
- Un bouton "Voir la conversation" pointant vers {dashboard_url}
- Les 5 derniers messages en encadré gris
- Footer discret ArtiBot

Retourne UNIQUEMENT le HTML complet, sans markdown, sans explication."""

        response = self.client.chat.completions.create(
            model=MODEL_FAST,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2048,
            temperature=0.3,
        )

        return response.choices[0].message.content.strip()
