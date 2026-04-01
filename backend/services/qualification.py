import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Champs nécessaires pour une qualification complète
QUALIFICATION_FIELDS = ["project_type", "surface", "location"]
# Champs supplémentaires pour un prospect "hot"
HOT_FIELDS = ["budget", "delay"]

# Seuil de messages avant qualification automatique (configurable par artisan)
DEFAULT_MESSAGE_THRESHOLD = 6


class QualificationService:
    """Évalue si un prospect est qualifié et calcule son score de maturité."""

    def evaluate_qualification(
        self,
        conversation: dict,
        prospect_data: dict,
        artisan_config: dict = None,
    ) -> dict:
        """
        Détermine si le rapport de qualification doit être envoyé.

        Condition A : nombre de messages >= seuil configurable
        Condition B : les champs clés sont renseignés

        Retourne :
        {
            "should_qualify": bool,
            "score": "cold|warm|hot",
            "missing_fields": [...],
            "reason": str
        }
        """
        config = artisan_config or {}
        threshold = config.get("message_threshold", DEFAULT_MESSAGE_THRESHOLD)
        messages = conversation.get("messages_json", [])
        message_count = len(messages)

        filled_core = [f for f in QUALIFICATION_FIELDS if prospect_data.get(f)]
        filled_hot = [f for f in HOT_FIELDS if prospect_data.get(f)]
        missing_core = [f for f in QUALIFICATION_FIELDS if not prospect_data.get(f)]

        score = self._compute_score(prospect_data, filled_core, filled_hot)

        # Condition B : champs clés renseignés
        condition_b = len(filled_core) >= len(QUALIFICATION_FIELDS)

        # Condition A : assez de messages ET au moins 1 champ core renseigné
        condition_a = message_count >= threshold and len(filled_core) >= 1

        should_qualify = (condition_a or condition_b) and conversation.get("status") != "qualified"

        reason = ""
        if condition_b:
            reason = f"Tous les champs clés collectés ({', '.join(filled_core)})"
        elif condition_a:
            reason = f"{message_count} messages échangés avec données partielles"

        return {
            "should_qualify": should_qualify,
            "score": score,
            "missing_fields": missing_core,
            "reason": reason,
        }

    def _compute_score(
        self,
        prospect_data: dict,
        filled_core: list[str],
        filled_hot: list[str],
    ) -> str:
        """
        Calcule le score de maturité :
        - cold  : données vagues, peu de champs renseignés
        - warm  : projet identifié, délai/budget flous
        - hot   : projet précis + délai court + budget mentionné
        """
        if len(filled_hot) >= 2 and len(filled_core) >= 2:
            delay = prospect_data.get("delay", "").lower()
            # Délai court = "urgent", "dès que possible", "< 1 mois", etc.
            urgent_keywords = ["urgent", "dès que possible", "rapidement", "asap", "semaine", "1 mois", "< 1 mois", "immédiatement"]
            if any(kw in delay for kw in urgent_keywords):
                return "hot"
            return "warm"
        elif len(filled_core) >= 1:
            return "warm"
        return "cold"

    def merge_prospect_data(self, existing: dict, new_data: dict) -> dict:
        """
        Fusionne les nouvelles données extraites par Claude dans le profil prospect existant.
        Les champs null/None ne remplacent pas les valeurs existantes.
        """
        merged = dict(existing)
        for key, value in new_data.items():
            if value is not None and value != "" and value != "null":
                merged[key] = value
        return merged

    def has_contact_info(self, prospect_data: dict) -> bool:
        """Vérifie si au moins un moyen de contact est disponible."""
        return bool(
            prospect_data.get("phone") or
            prospect_data.get("email") or
            prospect_data.get("name")
        )
