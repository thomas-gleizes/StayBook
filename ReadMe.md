
# StayBook — Spécification fonctionnelle (Domain Driven Design)

## Contexte fonctionnel : Plateforme de réservation de logements type “Airbnb”

### Objectif
Permettre la mise en relation entre **voyageurs** et **propriétaires**, avec gestion des réservations, paiements, notifications et synchronisation des disponibilités.

---

## Bounded Contexts identifiés

### 1. BC Utilisateurs
**Responsabilité :** Gestion des comptes (voyageurs / hôtes).  
**Entités principales :**
- `Utilisateur` (id, nom, email, rôle, statut)
- `Profil` (bio, photo, vérifications)

**Événements publiés :**
- `UtilisateurCréé`
- `ProfilMisÀJour`

**Interactions :**
- Envoi de `UtilisateurCréé` → BC Réservations & BC Paiement  
- Reçoit des événements de vérification (`PaiementRéussi`, `RéservationConfirmée`) pour enrichir le profil.

---

### 2. BC Logements
**Responsabilité :** Gestion des logements, disponibilité et tarification.  
**Entités principales :**
- `Logement` (id, propriétaireId, titre, prix, statut)
- `CalendrierDisponibilité`

**Événements publiés :**
- `LogementCréé`
- `DisponibilitéModifiée`
- `TarifModifié`

**Interactions :**
- Consomme `RéservationCréée` pour bloquer des dates.  
- Publie `DisponibilitéModifiée` que consomme le BC Réservations.

---

### 3. BC Réservations
**Responsabilité :** Orchestration des réservations (création, annulation, confirmation).  
**Entités principales :**
- `Réservation` (id, logementId, voyageurId, dates, statut)
- `SagaRéservation` (pour gérer la transaction inter-BC)

**Événements publiés :**
- `RéservationCréée`
- `RéservationConfirmée`
- `RéservationAnnulée`

**Interactions :**
- Déclenche une saga :
  1. Envoie `DemandePaiement` → BC Paiement  
  2. Attend `PaiementRéussi`  
  3. Envoie `BlocageDisponibilité` → BC Logements  
  4. Si succès, publie `RéservationConfirmée`  
  5. Si échec, envoie `AnnulationPaiement` (compensation)

---

### 4. BC Paiement
**Responsabilité :** Traitement des paiements et remboursements.  
**Entités principales :**
- `TransactionPaiement` (id, réservationId, montant, statut)

**Événements publiés :**
- `PaiementRéussi`
- `PaiementÉchoué`
- `RemboursementEffectué`

**Interactions :**
- Consomme `DemandePaiement` depuis BC Réservations.  
- En cas d’annulation, exécute `RemboursementEffectué`.

---

### 5. BC Notifications
**Responsabilité :** Communication vers les utilisateurs (email, SMS).  
**Entités principales :**
- `Notification` (type, destinataire, contenu)

**Événements consommés :**
- `RéservationConfirmée`  
- `PaiementRéussi`  
- `RéservationAnnulée`

---

## Flux d’exemple : Création de réservation (Saga + compensation)

1. Voyageur crée une réservation → `RéservationCréée` (BC Réservations).  
2. BC Réservations publie `DemandePaiement`.  
3. BC Paiement traite et publie `PaiementRéussi`.  
4. BC Réservations envoie `BlocageDisponibilité` à BC Logements.  
5. Si BC Logements bloque les dates → `DisponibilitéModifiée` → `RéservationConfirmée`.  
6. Si BC Logements échoue → envoie `AnnulationPaiement` → BC Paiement exécute `RemboursementEffectué`.

---

## Communication inter-BC
- **Message broker** (Kafka, RabbitMQ, NATS…).  
- Événements en **mode publish/subscribe**.  
- **Commandes asynchrones** pour les actions directes (`DemandePaiement`, `BlocageDisponibilité`).  

---

## Challenge technique
- Implémentation d’une **saga orchestrée** dans BC Réservations.  
- Gestion des **événements idempotents** (réception multiple).  
- Gestion de la **consistance éventuelle** entre BC.  
- Compensation automatique en cas d’échec partiel.  
