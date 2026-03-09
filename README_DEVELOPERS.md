# FlexiPass Developer Handoff

## But

Ce fichier sert de passation pour la suite du projet. Aucune implementation n'est demandee dans ce document. Le but est de repartir clairement les taches entre les developpeurs et de lister ce qui doit etre livre.

## Equipe

- Calvert Wanguy: Front End
- Piton Rodjesnky: Back End
- Guy: ajout des nouveaux produits, logos, prix, plans et contenus catalogue

## Contexte produit

- Pour le moment, l'API MonCash n'est pas encore active en production.
- Le flux commande doit quand meme fonctionner en mode temporaire/test.
- Chaque commande doit apparaitre dans l'admin.
- Chaque client doit voir ses commandes dans l'historique avec leur statut.
- Chaque client doit recevoir un email apres commande disant que sa commande est en cours d'execution.

## Priorite P0

### 1. Flux de commande temporaire sans MonCash actif

Objectif:
- Permettre au client de passer une commande meme si MonCash reel n'est pas encore branche.
- Creer la commande cote serveur des validation du paiement/test de paiement.
- Envoyer automatiquement la commande dans le dashboard admin.

Resultat attendu:
- Une commande creee depuis le checkout est enregistree en base.
- La commande apparait immediatement dans la page admin commandes.
- La commande apparait immediatement dans l'historique du client connecte.

Statut recommande temporaire:
- `processing` si la commande doit partir directement en execution
- ou `pending_payment` uniquement si vous gardez un mode attente pour les virements

Decision recommande:
- MonCash test => creer la commande directement avec statut `processing`
- Virement bancaire => creer la commande avec statut `pending_payment`

### 2. Notification email apres commande

Objectif:
- Apres chaque commande, le client recoit un email automatique.

Contenu minimum du mail:
- confirmation que la commande a ete recue
- numero ou identifiant de commande
- statut initial de la commande
- message: "Votre commande est en cours d'execution"

Resultat attendu:
- le client recoit un email apres la creation de commande
- l'email est envoye depuis le backend
- prevoir un mode fallback si SMTP ou provider email n'est pas encore configure

### 3. Historique client avec statut

Objectif:
- Quand le client ouvre l'historique, il doit voir toutes ses commandes et leur statut exact.

Statuts minimum:
- `pending_payment`
- `paid`
- `processing`
- `completed`
- `cancelled`

Resultat attendu:
- l'historique liste les commandes du client
- le client peut voir si la commande est en attente, en cours, terminee ou annulee
- les mises a jour de statut faites par l'admin doivent etre visibles dans l'historique

### 4. Dashboard admin commandes

Objectif:
- Toutes les commandes doivent arriver dans la partie admin.

Resultat attendu:
- la page admin commandes affiche les nouvelles commandes
- l'admin peut voir email client, date, total, methode de paiement, statut et details
- l'admin peut changer le statut
- les changements de statut doivent etre persistants

## Priorite P1

### 5. Integration MonCash pour les tests

Objectif:
- Ajouter une integration MonCash en mode test/sandbox, sans attendre l'activation finale.

Ce qu'il faut prevoir:
- structure backend propre pour brancher MonCash reel plus tard
- variables d'environnement dediees
- mode test active/desactive par config
- journalisation minimale des tentatives

Resultat attendu:
- le projet peut simuler ou tester un paiement MonCash
- le flux de commande ne depend pas encore du mode live
- le passage en production plus tard doit demander le moins de refactor possible

### 6. Parametres: changement email via verification email

Objectif:
- Quand l'utilisateur change son email dans Parametres, la verification doit passer par email.

Resultat attendu:
- l'utilisateur saisit un nouvel email
- un email de confirmation est envoye
- le changement ne devient effectif qu'apres validation
- message clair cote UI

Note:
- il existe deja une base cote front/Supabase, mais il faut verifier le parcours complet et le fiabiliser

### 7. Supprimer l'avatar

Objectif:
- Retirer l'avatar du profil et de la page Parametres.

Resultat attendu:
- plus de champ URL avatar
- plus de preview avatar
- garder seulement les infos utiles: nom, email, preferences, securite

### 8. Admin produits: choisir une photo au lieu d'un lien

Objectif:
- Dans la partie admin, on doit pouvoir choisir un fichier image au lieu de coller une URL.

Options techniques possibles:
- upload vers Supabase Storage
- ou upload vers un stockage serveur temporaire si besoin

Resultat attendu:
- champ fichier dans le formulaire add/edit produit
- preview image apres selection
- image enregistree et reutilisable sur le site
- suppression du besoin de coller une URL image manuellement

## Priorite P2

### 9. Ajouter les nouveaux produits

Responsable principal:
- Guy

Support:
- Calvert pour le rendu front
- Rodjesnky pour la persistance et l'import admin si necessaire

Produits a ajouter:
- Canva Pro
- Netflix
- Chat GPT Plus (GPT-5)
- Google AI
- Microsoft Office 365
- Nord VPN
- Prime Video
- Linkedin Premium
- Eleven Labs Premium
- Coursera
- Capcut Pro
- Adobe Creative Cloud
- Grok Premium
- Freepik Premium / Pro
- Apple Music
- Apple TV
- VIDIQ Boost & Coaching
- VEO 3
- SORA AI
- Claude Plus
- Figma Pro / organisation / entreprise
- TradingView
- Perplexity
- FlutterFlow

Actions demandees a Guy:
- fournir les bons noms commerciaux
- fournir les logos propres
- fournir les prix
- fournir les variantes/plans
- confirmer quels produits sont actifs au lancement

## Repartition par developpeur

### Calvert Wanguy - Front End

- brancher la page paiement sur la vraie creation de commande
- afficher un message de confirmation propre apres commande
- verifier que la commande apparait dans l'historique client
- verifier que la page admin commandes affiche bien les nouvelles commandes
- retirer tout le bloc avatar du profil et des parametres
- adapter le formulaire admin produits pour utiliser un champ fichier
- integrer visuellement les nouveaux produits ajoutes par Guy

Definition of done:
- aucun parcours bloque cote UI
- messages utilisateur clairs
- historique et admin lisibles sur desktop et mobile

### Piton Rodjesnky - Back End

- creer ou finaliser la route serveur de creation de commande
- inserer `orders` et `order_items`
- lier la commande a `user_id` et/ou `customer_email`
- envoyer un email automatique apres commande
- brancher le mode MonCash test
- garantir la recuperation correcte des commandes dans admin et historique
- preparer l'upload image admin cote backend/stockage
- documenter les variables d'environnement necessaires

Definition of done:
- une commande creee depuis le front est persistante
- admin et historique lisent la meme source de verite
- emails de confirmation fonctionnels
- MonCash test peut etre active via config

### Guy - Catalogue / contenu

- ajouter tous les nouveaux produits de la liste
- fournir les logos/visuels definitifs
- fournir les plans et variantes
- fournir les prix finaux
- verifier les noms exacts affiches au client

Definition of done:
- tous les nouveaux produits sont disponibles dans l'admin
- chaque produit a image, titre, prix, plan et description courte

## Ordre de travail recommande

1. Backend: creation de commande + insertion `orders` / `order_items`
2. Frontend: brancher checkout vers la route de commande
3. Backend: email apres commande
4. Frontend: affichage historique + verification admin
5. Backend: MonCash test
6. Frontend: suppression avatar + amelioration Parametres
7. Admin produits: upload image
8. Guy: ajout des nouveaux produits

## Checklist de validation finale

- une commande test cree une ligne dans `orders`
- les articles sont crees dans `order_items`
- la commande apparait dans `/admiflexipass/orders`
- la commande apparait dans `/history`
- le client recoit un email
- le statut change en admin et se met a jour dans l'historique
- le changement d'email passe par verification email
- l'avatar n'apparait plus
- l'admin peut choisir une image locale pour un produit
- les nouveaux produits sont visibles dans le catalogue

## Notes importantes

- Ne pas attendre MonCash live pour finaliser le flux commande.
- Construire le mode test maintenant, puis remplacer la couche de paiement plus tard.
- Garder une seule source de verite pour les commandes: la table `orders`.
- Eviter de dupliquer la logique de statut entre frontend et backend.
