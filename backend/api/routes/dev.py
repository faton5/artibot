"""
Endpoint de seed pour données de test — à ne pas exposer en production.
Usage : POST /api/dev/seed?artisan_id=<uuid>
"""
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models.database import Artisan, Prospect, Conversation

router = APIRouter(prefix="/api/dev", tags=["dev"])

FAKE_PROSPECTS = [
    {
        "name": "Marc Dupont",
        "phone": "06 12 34 56 78",
        "email": "marc.dupont@gmail.com",
        "project_type": "Fuite d'eau cuisine urgente",
        "surface": "12 m²",
        "location": "Lyon 3e",
        "budget": "800 – 1 200 €",
        "delay": "Immédiat",
        "score": "hot",
        "channel": "sms",
        "status": "escalated",
        "messages": [
            {"from": "prospect", "content": "Bonjour, j'ai une fuite sous l'évier, ça coule partout, c'est urgent !"},
            {"from": "bot",      "content": "Bonjour Marc ! Je comprends l'urgence. Pouvez-vous me décrire la fuite ? Robinet, joint ou tuyau ?"},
            {"from": "prospect", "content": "C'est le siphon sous l'évier, ça gicle quand on ouvre l'eau."},
            {"from": "bot",      "content": "Compris. Vous êtes disponible aujourd'hui dans l'après-midi pour une intervention ?"},
            {"from": "prospect", "content": "Oui dès 14h ça m'arrange"},
        ],
    },
    {
        "name": "Sophie Renard",
        "phone": "07 65 43 21 09",
        "email": "sophie.renard@outlook.fr",
        "project_type": "Rénovation tableau électrique",
        "surface": "Appartement 65 m²",
        "location": "Villeurbanne",
        "budget": "2 500 – 4 000 €",
        "delay": "Sous 3 semaines",
        "score": "warm",
        "channel": "email",
        "status": "qualified",
        "messages": [
            {"from": "prospect", "content": "Bonjour, je souhaite faire rénover mon tableau électrique. Mon installation date de 1985."},
            {"from": "bot",      "content": "Bonjour Sophie ! Votre demande est bien reçue. Combien de pièces fait votre logement ?"},
            {"from": "prospect", "content": "3 pièces, 65m2 environ. Je voudrais aussi ajouter des prises dans le salon."},
            {"from": "bot",      "content": "Parfait. J'enregistre votre projet. Nous vous recontacterons sous 48h pour un devis."},
        ],
    },
    {
        "name": "Thomas Leroy",
        "phone": "06 98 76 54 32",
        "email": "t.leroy@free.fr",
        "project_type": "Peinture complète appartement",
        "surface": "95 m²",
        "location": "Bron",
        "budget": "3 000 – 5 000 €",
        "delay": "Sous 6 semaines",
        "score": "warm",
        "channel": "sms",
        "status": "active",
        "messages": [
            {"from": "prospect", "content": "Bonjour, je cherche un peintre pour refaire tout mon appart avant emménagement."},
            {"from": "bot",      "content": "Bonjour Thomas ! Quel est la surface approximative à peindre ?"},
            {"from": "prospect", "content": "Environ 95m2, 4 pièces. Murs et plafonds."},
            {"from": "bot",      "content": "Noté. Quelle est votre date limite idéale pour les travaux ?"},
            {"from": "prospect", "content": "Je déménage dans 6 semaines donc assez vite"},
        ],
    },
    {
        "name": "Isabelle Moreau",
        "phone": None,
        "email": "imoreau@yahoo.fr",
        "project_type": "Renseignement installation climatisation",
        "surface": None,
        "location": "Saint-Priest",
        "budget": None,
        "delay": "Pas défini",
        "score": "cold",
        "channel": "email",
        "status": "active",
        "messages": [
            {"from": "prospect", "content": "Bonsoir, je voudrais des informations sur l'installation d'un climatiseur réversible."},
            {"from": "bot",      "content": "Bonsoir Isabelle ! Bien sûr. Pour quelle superficie souhaitez-vous climatiser ?"},
            {"from": "prospect", "content": "Je ne sais pas encore exactement, je suis juste en train de me renseigner pour l'instant."},
        ],
    },
    {
        "name": "Karim Bensaid",
        "phone": "07 11 22 33 44",
        "email": "karim.bensaid@gmail.com",
        "project_type": "Cuisine sur mesure complète",
        "surface": "18 m²",
        "location": "Lyon 6e",
        "budget": "12 000 – 18 000 €",
        "delay": "Dans 2 mois",
        "score": "hot",
        "channel": "whatsapp",
        "status": "qualified",
        "messages": [
            {"from": "prospect", "content": "Bonjour ! Je refais entièrement ma cuisine, j'ai besoin d'un devis complet menuiserie + carrelage."},
            {"from": "bot",      "content": "Bonjour Karim ! Beau projet. Quelle est la surface de votre cuisine ?"},
            {"from": "prospect", "content": "18m2, on veut tout démolir et repartir de zéro. Budget autour de 15k€."},
            {"from": "bot",      "content": "Excellent. Avez-vous déjà un plan ou des inspirations ? Je transmets votre demande pour un RDV de chiffrage."},
            {"from": "prospect", "content": "Oui j'ai des photos Pinterest, je peux les envoyer. Disponible vendredi matin."},
            {"from": "bot",      "content": "Parfait, je note vendredi matin. Vous recevrez une confirmation par SMS."},
        ],
    },
]


@router.post("/seed")
def seed_prospects(artisan_id: UUID, db: Session = Depends(get_db)):
    """Crée 5 faux prospects + conversations pour tester l'interface."""
    artisan = db.query(Artisan).filter(Artisan.id == artisan_id).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan non trouvé")

    created = 0
    base_time = datetime.utcnow() - timedelta(days=3)

    for i, data in enumerate(FAKE_PROSPECTS):
        prospect = Prospect(
            artisan_id=artisan_id,
            name=data["name"],
            phone=data["phone"],
            email=data["email"],
            project_type=data["project_type"],
            surface=data["surface"],
            location=data["location"],
            budget=data["budget"],
            delay=data["delay"],
            score=data["score"],
            created_at=base_time + timedelta(hours=i * 8),
        )
        db.add(prospect)
        db.flush()

        messages_with_time = []
        for j, msg in enumerate(data["messages"]):
            messages_with_time.append({
                **msg,
                "channel": data["channel"],
                "sent_at": (base_time + timedelta(hours=i * 8, minutes=j * 3)).isoformat(),
            })

        conv = Conversation(
            artisan_id=artisan_id,
            prospect_id=prospect.id,
            channel=data["channel"],
            status=data["status"],
            messages_json=messages_with_time,
            bot_active=1 if data["status"] != "escalated" else 0,
            created_at=base_time + timedelta(hours=i * 8),
        )
        db.add(conv)
        created += 1

    db.commit()
    return {"status": "ok", "prospects_created": created}
