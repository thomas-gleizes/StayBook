import { Injectable, Logger } from '@nestjs/common';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaAdmin } from './kafka.admin';

@Injectable()
export class KafkaRunner {
  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly admin: KafkaAdmin,
  ) {}

  async listen() {
    await this.admin.checkAndCreateTopics();
    await this.consumer.run();
  }
}
