# Plan MVP Vendable

## Objectif

Ce document liste tout ce qu'il faudrait ajouter ou finaliser pour qu'ArtiBot passe de "MVP impressionnant" à "MVP réellement vendable", d'abord en pilote accompagné, puis en SaaS plus structuré.

Le principe n'est pas de tout construire d'un coup. Il faut d'abord fermer ce qui bloque la vente, la compréhension produit et la confiance des premiers artisans.

## Diagnostic honnête

Aujourd'hui, ArtiBot peut être montré et testé. Le coeur de valeur est déjà là :

- réception d'un message
- réponse IA
- qualification du prospect
- rapport envoyé à l'artisan
- reprise en main humaine

En revanche, il manque encore plusieurs briques pour que le produit soit perçu comme un vrai outil métier prêt à être payé.

## Niveau 1

### À faire avant de vendre à 3 à 5 artisans pilotes

#### 1. Page `Prospects`

##### Pourquoi

- Un artisan pense en prospects, pas seulement en conversations.
- Il faut pouvoir retrouver rapidement les leads chauds.
- Le score `cold / warm / hot` existe déjà, mais il n'a pas encore sa vue métier dédiée.

##### Ce qu'il faut afficher

- nom
- téléphone
- email
- score
- type de projet
- ville / localisation
- budget
- délai
- canal
- dernier échange
- lien vers la conversation

##### Priorité

Très haute.

#### 2. Page `Rapports`

##### Pourquoi

- Le rapport de qualification est une sortie produit centrale.
- Aujourd'hui il est généré, mais il n'existe pas comme objet vraiment visible dans l'app.
- Le client doit pouvoir retrouver tous ses rapports passés.

##### Ce qu'il faut afficher

- prospect concerné
- date d'envoi
- score
- canal
- aperçu du rapport
- lien vers la conversation

##### Priorité

Très haute.

#### 3. Page `Intégrations`

##### Pourquoi

- Gmail n'est pas juste un paramètre secondaire.
- Il faut une page claire qui dit : connecté, en attente, erreur, non configuré.
- Plus tard, cette page servira aussi pour SMS et WhatsApp.

##### Ce qu'il faut afficher

- Gmail connecté / non connecté
- dernier état connu
- futur numéro SMS
- état des webhooks si utile

##### Priorité

Très haute.

#### 4. Checklist de mise en route

##### Pourquoi

- Un artisan doit comprendre immédiatement ce qu'il lui manque pour être opérationnel.
- Cela rassure et réduit la confusion au début.

##### Étapes à suivre

- Gmail connecté
- base de connaissances remplie
- ton du bot configuré
- message d'accueil configuré
- première conversation test reçue

##### Priorité

Haute.

#### 5. Onboarding encore plus métier

##### Pourquoi

- Le flow est déjà bon, mais il doit encore mieux montrer la finalité produit.
- Il faut rassurer l'artisan sur ce qui se passera après configuration.

##### À améliorer

- micro-copy plus orientée résultat
- meilleure explication des canaux
- aperçu du comportement du bot
- messages de confirmation plus clairs

##### Priorité

Haute.

#### 6. Prompt par métier

##### Pourquoi

- Les artisans n'ont pas tous les mêmes attentes.
- Un peintre, un plombier et un électricien ne parlent pas pareil ni des mêmes informations.

##### MVP minimum

- peintre
- plombier
- électricien
- menuisier

##### Priorité

Haute.

#### 7. Réponses adaptées au canal

##### Pourquoi

- Aujourd'hui, email et SMS utilisent pratiquement le même style.
- Pour être crédible, le bot doit écrire différemment selon le canal.

##### À faire

- email : plus poli, plus complet
- SMS : plus court, plus direct
- plus tard web : plus conversationnel

##### Priorité

Haute.

#### 8. Historique de rapports dans l'app

##### Pourquoi

- Il ne suffit pas que le rapport parte par email.
- Il faut qu'il soit visible et consultable dans l'application.

##### Priorité

Haute.

#### 9. Vue conversation plus rassurante

##### Pourquoi

- L'artisan doit sentir clairement qui a répondu, quand le bot agit, et quand il reprend la main.
- Il faut réduire le doute opérationnel.

##### À renforcer

- statut bot / humain
- statut qualifié / fermé / escaladé
- meilleure lisibilité de la timeline

##### Priorité

Haute.

#### 10. Recherche et filtres utiles partout

##### Pourquoi

- La recherche ne doit pas rester limitée aux conversations.
- Prospects et rapports doivent être filtrables aussi.

##### Priorité

Moyenne à haute.

#### 11. Gestion des erreurs plus propre

##### Pourquoi

- Les premiers clients vont très vite tomber sur des erreurs de config ou de webhook.
- Il faut des messages clairs plutôt qu'un silence ou une erreur technique.

##### À couvrir

- Gmail non connecté
- base de connaissances vide
- erreur d'envoi
- webhook non joignable

##### Priorité

Haute.

#### 12. Déploiement stable

##### Pourquoi

- Impossible de vendre si les webhooks et le dashboard ne sont pas fiables.
- Il faut une version stable sur domaine public avec SSL.

##### À finaliser

- VPS
- DNS
- SSL
- webhooks Gmail bout en bout

##### Priorité

Très haute.

#### 13. Tests terrain avec vrais artisans

##### Pourquoi

- C'est le vrai juge de paix.
- Tant que 3 à 5 artisans n'ont pas confirmé que le gain de temps est réel, le produit n'est pas vraiment validé.

##### Priorité

Maximale.

## Niveau 2

### Important juste après les premiers clients

#### Notifications

- prospect chaud
- rapport envoyé
- conversation escaladée
- erreur bot ou intégration

#### Readiness API

- endpoint qui calcule si le compte client est prêt à l'usage

#### KPI métier

- prospects reçus
- prospects qualifiés
- temps de réponse
- rapports envoyés
- taux de reprise humaine

#### Templates de base de connaissances

- packs de FAQ préremplis par métier

#### Suggestions de Q&A

- extraire de futures entrées FAQ depuis les conversations réelles

#### Logs métier

- comprendre pourquoi un message n'a pas été traité ou pourquoi le bot a échoué

#### Relances

- si prospect chaud sans réponse artisan sous X heures

#### Landing page

- bénéfices
- preuve sociale
- pricing
- formulaire contact

#### Mentions légales / RGPD

- confidentialité
- CGU
- politique de traitement des données

## Niveau 3

### À faire plus tard, pas maintenant

#### SMS FR

- réglementairement plus lourd
- à traiter après validation du produit

#### Widget web

- très intéressant
- mais après validation email-first

#### WhatsApp

- plus tard aussi
- une fois les autres canaux stabilisés

#### Facturation

- Stripe
- plans
- essais

#### Multi-utilisateur

- rôles
- permissions
- équipes

#### Automatisations avancées

- tags
- règles
- relances conditionnelles

## Ce qu'il faut faire maintenant

### Ordre recommandé

1. page `Prospects`
2. page `Rapports`
3. page `Intégrations`
4. checklist de mise en route sur le dashboard
5. prompts distincts `email` / `sms`
6. prompts spécialisés par métier
7. test réel Gmail end-to-end
8. landing page simple

## Ce qu'il ne faut pas faire maintenant

- SMS FR en profondeur
- WhatsApp
- grosse refonte design
- facturation complète
- permissions avancées
- websocket si le polling suffit

## Ce qui bloque vraiment la vente aujourd'hui

Les vrais manques bloquants sont :

- `Prospects`
- `Rapports`
- `Intégrations`
- `Checklist de readiness`
- `Validation terrain`

Le reste est secondaire à court terme.

## Vision commerciale réaliste

### Aujourd'hui

ArtiBot peut être vendu comme :

- un pilote payant
- un test accompagné
- un MVP avec onboarding assisté

### Pas encore

ArtiBot n'est pas encore au niveau pour :

- acquisition large
- self-serve complet
- pub froide vers des artisans inconnus

## Conclusion

Oui, le produit peut devenir un SaaS vendable.  
Mais pour y arriver rapidement, il faut arrêter d'ajouter des briques secondaires et fermer en priorité les éléments qui rendent le produit lisible, rassurant et actionnable pour un artisan.

La bonne logique n'est pas "tout faire".  
La bonne logique est : rendre ArtiBot suffisamment clair et utile pour que les premiers artisans acceptent de payer.
