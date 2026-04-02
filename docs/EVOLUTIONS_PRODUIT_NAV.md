# Evolutions Produit et Navigation

## Objectif

Cette note décrit ce qu'il faudrait rajouter dans le produit ArtiBot pour rendre l'interface plus claire pour un artisan, pourquoi ces éléments sont utiles, et avec quelles briques techniques les construire.

## Constat actuel

Navigation actuelle :

- `Conversations`
- `Base de connaissance`
- `Statistiques`
- `Paramètres`

Cette base est correcte pour un back-office technique, mais elle reste incomplète pour un usage SaaS métier. Le produit tourne aujourd'hui surtout autour des conversations, alors qu'un artisan pense d'abord en :

- prospects
- rapports
- canaux connectés
- état de préparation du compte

## Ajouts prioritaires

### 1. `Prospects`

#### Pourquoi

- Un artisan veut retrouver rapidement ses leads chauds sans relire toutes les conversations.
- Le score `cold / warm / hot` existe déjà dans le backend, mais il n'a pas encore sa vraie vue métier.
- Cela permet de voir une liste actionnable : qui rappeler, qui relancer, qui a été qualifié.

#### Ce qu'il faut afficher

- nom
- email / téléphone
- score
- type de projet
- localisation
- budget
- délai
- canal d'origine
- date du dernier échange
- statut de conversation associé

#### Avec quoi

- Frontend : `Next.js App Router`, `SWR`, `shadcn/ui` (`Table`, `Badge`, `Input`, `Select`)
- Backend : nouveau endpoint `GET /api/prospects`
- DB : lecture des tables `prospects` + jointure avec `conversations`

#### Recommandation MVP

- Filtres : `score`, `canal`, `statut`
- Tri : plus récent / plus chaud
- CTA : `Voir conversation`

### 2. `Rapports`

#### Pourquoi

- Le rapport de qualification est une sortie produit majeure.
- Aujourd'hui il est généré et envoyé, mais il n'existe pas comme objet visible dans le dashboard.
- Le client doit pouvoir retrouver tous les rapports déjà envoyés.

#### Ce qu'il faut afficher

- prospect concerné
- date d'envoi
- score
- canal
- aperçu du rapport
- lien vers la conversation

#### Avec quoi

- Frontend : `Next.js`, `Card`, `Dialog`, `Badge`
- Backend : `GET /api/reports`, `GET /api/reports/:id`
- DB : table `rapports` déjà présente

#### Recommandation MVP

- Liste simple triée par date décroissante
- clic pour ouvrir l'HTML du rapport
- lien direct vers `/dashboard/[id]`

### 3. `Integrations`

#### Pourquoi

- Gmail, SMS demain, WhatsApp plus tard : ce sont des briques critiques, pas juste des paramètres secondaires.
- Une page dédiée rend l'état des canaux immédiatement compréhensible.
- C'est le bon endroit pour voir : connecté, en attente, non configuré.

#### Ce qu'il faut afficher

- Gmail : connecté / non connecté
- SMS : numéro attribué / en attente
- futur WhatsApp : non disponible / à venir
- état du webhook
- dernière synchro si utile

#### Avec quoi

- Frontend : `Card`, `Badge`, `Button`, `Alert`
- Backend : endpoints existants côté artisan + futurs endpoints de health canal

#### Recommandation MVP

- Déplacer la partie canaux actuellement dans `Paramètres`
- Garder `Paramètres` pour la config IA et profil

### 4. `Checklist de mise en route`

#### Pourquoi

- Au début, un artisan ne sait pas ce qu'il doit faire ensuite.
- Il faut rendre visible le statut du compte sans l'obliger à fouiller dans plusieurs pages.

#### Ce qu'il faut vérifier

- Gmail connecté
- base de connaissances non vide
- ton du bot configuré
- message d'accueil configuré
- au moins une conversation test reçue

#### Avec quoi

- Frontend : composant `ChecklistCard` sur le dashboard
- Backend : endpoint léger `GET /api/artisans/:id/readiness`

#### Recommandation MVP

- Carte en haut du dashboard
- progression simple : `3/5 étapes terminées`

## Ajustements de navigation recommandés

### Navigation cible MVP

- `Conversations`
- `Prospects`
- `Rapports`
- `Base de connaissances`
- `Intégrations`
- `Statistiques`
- `Paramètres`

### Pourquoi cette structure

- `Conversations` = suivi opérationnel en temps réel
- `Prospects` = vision commerciale
- `Rapports` = sortie IA exploitable
- `Base de connaissances` = qualité des réponses
- `Intégrations` = état technique utile au métier
- `Statistiques` = lecture globale
- `Paramètres` = configuration de l'assistant

## Ce que je ne rajouterais pas tout de suite

- facturation
- gestion d'équipe
- permissions avancées
- logs techniques détaillés
- centre d'aide complet
- CRM complexe

Ces éléments peuvent venir plus tard, mais ils risquent de disperser le MVP.

## Roadmap UI recommandée

### Priorité 1

- page `Prospects`
- page `Rapports`
- correction libellé `Base de connaissances`
- séparation `Intégrations` / `Paramètres`

### Priorité 2

- checklist de mise en route
- notifications visibles dans le dashboard
- filtres plus riches

### Priorité 3

- recherche globale
- actions groupées sur prospects
- centre de notifications

## Endpoints backend à ajouter

### Prospects

- `GET /api/prospects?artisan_id=...`
- `GET /api/prospects/:id`

### Rapports

- `GET /api/reports?artisan_id=...`
- `GET /api/reports/:id`

### Readiness

- `GET /api/artisans/:id/readiness`

Réponse attendue :

```json
{
  "gmail_connected": true,
  "knowledge_ready": false,
  "bot_config_ready": true,
  "welcome_message_ready": true,
  "has_test_conversation": false,
  "completed_steps": 3,
  "total_steps": 5
}
```

## Résumé

Les deux manques les plus importants dans le produit actuel sont :

- une vraie vue `Prospects`
- une vraie vue `Rapports`

Ce sont les deux ajouts qui rendront ArtiBot plus lisible, plus concret et plus utile pour un artisan.
