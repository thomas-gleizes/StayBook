import { Kafka } from "kafkajs";
import { getEnvironment } from "./config/environment";
import { SERVICE_NOMENCLATURE } from "./config/constants";
import { PrismaClient } from "generated/prisma/client";

type Event = {
  id: string;
  content_type: string;
  aggregate_id: string;
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
    eachBatch: async ({ batch, heartbeat, resolveOffset }) => {
      const interval = setInterval(() => heartbeat(), 5_000);

      for (const message of batch.messages) {
        if (!message.value) continue;

        try {
          const event = JSON.parse(message.value.toString()) as Event;

          console.log("Event", event);

          await prisma.event.upsert({
            where: { id: event.id },
            create: {
              id: event.id,
              contentType: event.content_type,
              aggregate: batch.topic,
              aggregateId: event.aggregate_id,
              state: event.state,
              version: event.version,
              occurredAt: event.occurred_at,
              createdAt: event.created_at,
              createdBy: event.created_by,
              payload: event.payload,
              metadata: event.metadata,
            },
            update: {},
          });
        } catch (error) {
          console.log("ERROR", error);
          throw error;
        }
      }

      clearInterval(interval);
    },
  });
}

bootstrap();
