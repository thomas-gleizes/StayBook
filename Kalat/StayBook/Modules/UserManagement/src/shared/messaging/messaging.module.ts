import { Global, Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { MessagingPublisher } from './messaging.publisher';

@Global()
@Module({
  imports: [KafkaModule],
  providers: [MessagingPublisher],
  exports: [MessagingPublisher],
})
export class MessagingModule {}
