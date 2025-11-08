import { Kafka } from "kafkajs";
import { getEnvironment } from "./config/environment";
import { SERVICE_NOMENCLATURE } from "./config/constants";
import { PrismaClient } from "generated/prisma/client";

type Event = {
  id: string;
  content_type: string;
  aggregate_id: string;
  aggregate_type: string;
  state: string;
  version: number;
  occurred_at: string;
  created_at: string;
  created_by: string;
  payload: any;
  metadata: any;
};

async function bootstrap() {
  const prisma = new PrismaClient();

  const environment = getEnvironment(process.env);

  const broker = new Kafka({ brokers: environment.KAFKA_BROKERS });
  const consumer = broker.consumer({
    groupId: SERVICE_NOMENCLATURE,
    heartbeatInterval: 20_000,
    sessionTimeout: 60_000,
  });

  await consumer.subscribe({ topic: /domain/, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        if (!message.value) return;

        const event: Event = JSON.parse(message.value.toString());

        await prisma.event.create({
          data: {
            id: event.id,
            contentType: event.content_type,
            aggregate: event.aggregate_type,
            aggregateId: event.aggregate_id,
            state: event.state,
            version: event.version,
            occurredAt: event.occurred_at,
            createdAt: event.created_at,
            createdBy: event.created_by,
            payload: event.payload,
            metadata: event.metadata,
          },
        });
      } catch (error) {
        console.log("Error", error);
      }
    },
  });
}

bootstrap();
