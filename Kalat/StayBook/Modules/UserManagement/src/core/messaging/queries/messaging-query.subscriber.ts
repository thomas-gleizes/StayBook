import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/utils/constants';
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage, QueryMessage } from '../messaging.interface';
import { MessagingPublisher } from '../messaging.publisher';
import { QUERY_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { InboxService } from '../../inbox/inbox.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingQuerySubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<IQuery>; handler: IQueryHandler }>();

  private static FQN = `${SERVICE_FQN}.query.`;

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly inbox: InboxService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.register();
    await this.subscribe();
  }

  private register() {
    const providers = this.discoveryService.getProviders();

    for (const provider of providers) {
      if (provider.metatype) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const metadata = this.reflector.get(QUERY_HANDLER_METADATA, provider.metatype);

        if (metadata) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.commands.set(metadata.name, { instance: metadata, handler: provider.instance });
        }
      }
    }
  }

  private async subscribe() {
    const topics = Array.from(this.commands.keys()).map((name) => `${MessagingQuerySubscriber.FQN}${name}`);

    await this.consumer.subscribe<QueryMessage<any>>(
      { topics, fromBeginning: true },
      async (topic, message) => {
        try {
          await this.prisma.$transaction(async (transaction) => {
            await this.inbox.saveQuery(transaction, [message]);
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
