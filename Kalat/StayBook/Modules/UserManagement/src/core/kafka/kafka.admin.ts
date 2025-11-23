import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Kafka, Admin } from 'kafkajs';
import { KAFKA_BROKER } from './kafka.token';
import { environment } from '../config/environment';
import { KAFKA_TOPICS } from './kafka.topics';

@Injectable()
export class KafkaAdmin {
  private readonly logger = new Logger(KafkaAdmin.name);
  private static readonly TOPICS = Object.values(KAFKA_TOPICS);

  private readonly admin: Admin;

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
  ) {
    this.admin = broker.admin();
  }

  async checkAndCreateTopics() {
    try {
      await this.admin.connect();
      this.logger.log('Connected to Kafka this.admin');

      const existingTopics = await this.admin.listTopics();
      const missingTopics = KafkaAdmin.TOPICS.filter((topic) => !existingTopics.includes(topic));

      if (missingTopics.length === 0) {
        this.logger.log('All required Kafka topics exist.');
        return;
      }

      this.logger.warn(`Missing Kafka topics: ${missingTopics.join(', ')}`);

      if (environment.NODE_ENV === 'development') {
        this.logger.log('Development mode detected. Creating missing topics...');
        await this.admin.createTopics({
          topics: missingTopics.map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          })),
        });
        this.logger.log(`Successfully created topics: ${missingTopics.join(', ')}`);
      } else {
        this.logger.warn(
          `Missing topics in production: ${missingTopics.join(', ')}. Please create them manually.`,
        );
      }
    } catch (error) {
      this.logger.error('Error checking/creating Kafka topics', error);
    } finally {
      await this.admin.disconnect();
    }
  }
}
