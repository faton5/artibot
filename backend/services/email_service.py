import logging
from datetime import datetime
from typing import Optional

import resend

from backend.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Génère et envoie les rapports de qualification via Resend."""

    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = "rapports@artibot.fr"
        self.from_name = "ArtiBot — Rapports"

    async def send_qualification_report(
        self,
        artisan_email: str,
        artisan_name: str,
        html_content: str,
        prospect_name: Optional[str] = None,
    ) -> bool:
        """
        Envoie le rapport HTML au mail de l'artisan via Resend.
        Retourne True si succès, False sinon.
        """
        prospect_label = f" — {prospect_name}" if prospect_name else ""
        subject = f"[ArtiBot] Nouveau prospect qualifié{prospect_label}"

        try:
            params = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [artisan_email],
                "subject": subject,
                "html": html_content,
            }
            response = resend.Emails.send(params)
            logger.info(f"Rapport envoyé à {artisan_email} — ID: {response.get('id')}")
            return True
        except Exception as e:
            logger.error(f"Erreur envoi rapport Resend : {e}")
            return False

    def generate_fallback_html(
        self,
        artisan_name: str,
        prospect_data: dict,
        score: str,
        last_messages: list[dict],
        dashboard_url: str,
        channel: str,
    ) -> str:
        """
        Génère un HTML de rapport simple sans appel LLM (fallback).
        Utilisé si la génération Claude échoue.
        """
        score_labels = {"cold": "Froid", "warm": "Tiède", "hot": "Chaud"}
        score_colors = {"cold": "#64748b", "warm": "#f59e0b", "hot": "#ef4444"}
        score_label = score_labels.get(score, score)
        score_color = score_colors.get(score, "#64748b")

        messages_html = ""
        for msg in last_messages[-5:]:
            who = "Prospect" if msg.get("from") == "prospect" else "Bot"
            content = msg.get("content", "").replace("<", "&lt;").replace(">", "&gt;")
            messages_html += f"""
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #374151; width: 80px;">{who}</td>
                <td style="padding: 8px 12px; color: #6b7280;">{content}</td>
            </tr>"""

        fields = [
            ("Nom", prospect_data.get("name")),
            ("Email", prospect_data.get("email")),
            ("Téléphone", prospect_data.get("phone")),
            ("Type de travaux", prospect_data.get("project_type")),
            ("Surface / Quantité", prospect_data.get("surface")),
            ("Localisation", prospect_data.get("location")),
            ("Budget estimé", prospect_data.get("budget")),
            ("Délai souhaité", prospect_data.get("delay")),
        ]

        fields_html = ""
        for label, value in fields:
            if value:
                fields_html += f"""
                <tr>
                    <td style="padding: 8px 16px; color: #6b7280; font-weight: 500; width: 160px;">{label}</td>
                    <td style="padding: 8px 16px; color: #111827;">{value}</td>
                </tr>"""

        date_str = datetime.utcnow().strftime("%d/%m/%Y à %H:%M")
        channel_label = {"email": "Email", "sms": "SMS", "whatsapp": "WhatsApp"}.get(channel, channel)

        return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rapport de qualification ArtiBot</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <!-- Header -->
    <tr>
      <td style="background: #2563eb; padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ArtiBot</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Rapport de qualification — {date_str}</p>
      </td>
    </tr>

    <!-- Score badge -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Bonjour {artisan_name},</p>
        <p style="margin: 0 0 16px; color: #374151;">Un nouveau prospect a été qualifié via <strong>{channel_label}</strong>.</p>
        <div style="display: inline-block; background: {score_color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          Maturité : {score_label}
        </div>
      </td>
    </tr>

    <!-- Données prospect -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Informations prospect</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          {fields_html}
        </table>
      </td>
    </tr>

    <!-- Derniers messages -->
    <tr>
      <td style="padding: 24px 32px 0;">
        <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Derniers échanges</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; border-collapse: collapse;">
          {messages_html}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding: 32px; text-align: center;">
        <a href="{dashboard_url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Voir la conversation complète
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">ArtiBot — Assistant IA pour artisans · rapports@artibot.fr</p>
      </td>
    </tr>
  </table>
</body>
</html>"""
