import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { ActionMessage, CommandMessage, QueryMessage, RawActionMessage } from '../messaging.interface';
import { QUERY_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { InboxService } from '../../inbox/inbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistererService } from '../../registerer/registerer.service';

@Injectable()
export class MessagingQuerySubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<IQuery>; handler: IQueryHandler }>();

  private static FQN = `${SERVICE_FQN}.query.`;

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
    const providers = this.registerer.findByMetadata<Type<IQuery>>(QUERY_HANDLER_METADATA);

    for (const [handler, query] of providers)
      this.commands.set(query.name, { instance: query, handler: handler.instance });
  }

  private async subscribe() {
    const topics = Array.from(this.commands.keys()).map((name) => `${MessagingQuerySubscriber.FQN}${name}`);

    await this.consumer.subscribe<RawActionMessage>(
      { topics, fromBeginning: true },
      async (topic, message) => {
        this.logger.debug('QUERY HANDLE', topic, message);

        try {
          await this.prisma.$transaction(async (transaction) => {
            // await this.inbox.saveQuery(transaction, [message]);
          });
        } catch (error) {
          console.log('Error', error);
          throw error;
        }
      },
    );
  }

  private reconstructClass(Command: Type<ICommand>, value: CommandMessage<any>['payload']): ICommand {
    if (typeof value === 'object' && value !== null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Object.assign(Object.create(Command.prototype), value);

    return new Command(value);
  }
}
