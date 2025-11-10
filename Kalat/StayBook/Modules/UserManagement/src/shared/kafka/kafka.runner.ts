import { Injectable, Logger } from '@nestjs/common';
import { KafkaConsumer } from './kafka.consumer';

@Injectable()
export class KafkaRunner {
  private readonly logger = new Logger('Runner');

  constructor(private readonly consumer: KafkaConsumer) {}

  async listen() {
    await this.consumer.run();
  }
}
