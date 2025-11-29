#!/bin/bash

# Configuration via variables d'environnement (avec valeurs par défaut)
KAFKA_BROKER=${KAFKA_BROKER:-"kafka:29092"}
PARTITIONS=${KAFKA_PARTITIONS:-1}
REPLICATION_FACTOR=${KAFKA_REPLICATION:-1}

# Tableau des topics à créer
TOPICS=(
    "Kalat.StayBook.Modules.Housing.v1.command.CreateHousing"
    "Kalat.StayBook.Modules.Housing.v1.command.CreateHousing.reply"
    "Kalat.StayBook.Modules.Housing.v1.domain.HousingCreated"
)

echo "------------------------------------------------"
echo "Script d'initialisation des Topics Kafka"
echo "Broker: $KAFKA_BROKER"
echo "Partitions par défaut: $PARTITIONS"
echo "Replication factor: $REPLICATION_FACTOR"
echo "------------------------------------------------"

# Création des topics
for TOPIC in "${TOPICS[@]}"; do
    echo "Traitement du topic : $TOPIC"

    /opt/kafka/bin/kafka-topics.sh  --bootstrap-server "$KAFKA_BROKER" \
        --create \
        --if-not-exists \
        --topic "$TOPIC" \
        --partitions "$PARTITIONS" \
        --replication-factor "$REPLICATION_FACTOR"

    if [ $? -eq 0 ]; then
        echo "-> Succès (ou déjà existant)"
    else
        echo "-> Erreur lors de la création de $TOPIC"
    fi
done

echo "------------------------------------------------"
echo "Initialisation terminée."
