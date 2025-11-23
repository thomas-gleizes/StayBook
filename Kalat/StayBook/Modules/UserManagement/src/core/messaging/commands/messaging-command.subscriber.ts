import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/utils/constants';
import { ICommand, ICommandHandler, IQuery } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage, RawActionMessage } from '../messaging.interface';
import { InboxService } from '../../inbox/inbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistererService } from '../../registerer/registerer.service';

@Injectable()
export class MessagingCommandSubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<ICommand>; handler: ICommandHandler }>();

  private static BASE_TOPIC = `${SERVICE_FQN}.command.`;

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly inbox: InboxService,
    private readonly prisma: PrismaService,
    private readonly registerer: RegistererService,
  ) {}

  async onModuleInit() {
    this.register();
    await this.subscribe();
  }

  private register() {
    const providers = this.registerer.findByMetadata<Type<ICommand>>(COMMAND_HANDLER_METADATA);

    for (const [handler, command] of providers)
      this.commands.set(command.name, { instance: command, handler: handler.instance });
  }

  private async subscribe() {
    const topics = Array.from(this.commands.keys()).map(
      (name) => `${MessagingCommandSubscriber.BASE_TOPIC}${name}`,
    );

    await this.consumer.subscribe<RawActionMessage>(
      { topics, fromBeginning: true },
      async (topic, message) => {
        this.logger.debug('Command Handle', topic, message);
        try {
          // await this.prisma.$transaction(async (transaction) => {
          //   await this.inbox.saveCommand(transaction, [message]);
          // });
        } catch (error) {
          console.log('Error', error);
          throw error;
        }
      },
    );
  }
}
