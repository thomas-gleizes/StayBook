import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/utils/constants';
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage, QueryMessage } from '../messaging.interface';
import { MessagingPublisher } from '../messaging.publisher';
import { QUERY_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

@Injectable()
export class MessagingQuerySubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<IQuery>; handler: IQueryHandler }>();

  private static NOMENCLATURE = `${SERVICE_FQN}.query.`;

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly publisher: MessagingPublisher,
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
    const topics = Array.from(this.commands.keys()).map(
      (name) => `${MessagingQuerySubscriber.NOMENCLATURE}${name}`,
    );

    await this.consumer.subscribe<QueryMessage<any>>(
      { topics, fromBeginning: true },
      async (topic, message) => {
        const queryName = topic.replace(MessagingQuerySubscriber.NOMENCLATURE, '');

        const query = this.commands.get(queryName);

        if (!query) return this.logger.debug(`No handler found for '${queryName}'`);

        this.logger.debug(`Handle : ${queryName}`);

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = await query.handler.execute(this.reconstructClass(query.instance, message.payload));

          await this.publisher.publishReply(result, message);
        } catch (error) {
          this.logger.error(`${queryName} : ${error}`);
          await this.publisher.publishError(error, message);
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
