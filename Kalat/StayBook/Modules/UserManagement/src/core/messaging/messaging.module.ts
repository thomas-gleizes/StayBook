import { Global, Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { MessagingPublisher } from './messaging.publisher';
import { DiscoveryModule } from '@nestjs/core';
import { MessagingCommandSubscriber } from './commands/messaging-command.subscriber';
import { MessagingQuerySubscriber } from './queries/messaging-query.subscriber';
import { MessagingEventSubscriber } from './events/messaging-event.subscriber';

@Global()
@Module({
  imports: [KafkaModule, DiscoveryModule],
  providers: [MessagingPublisher, MessagingCommandSubscriber, MessagingQuerySubscriber, MessagingEventSubscriber],
  exports: [MessagingPublisher],
})
export class MessagingModule {}
