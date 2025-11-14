import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/utils/constants';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage, ReplyMessage } from '../messaging.interface';
import { MessagingPublisher } from '../messaging.publisher';

@Injectable()
export class MessagingCommandSubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<ICommand>; handler: ICommandHandler }>();

  private static NOMENCLATURE = `${SERVICE_FQN}.command.`;

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
        const metadata = this.reflector.get(COMMAND_HANDLER_METADATA, provider.metatype);

        if (metadata) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.commands.set(metadata.name, { instance: metadata, handler: provider.instance });
        }
      }
    }
  }

  private async subscribe() {
    const topics = Array.from(this.commands.keys()).map(
      (name) => `${MessagingCommandSubscriber.NOMENCLATURE}${name}`,
    );

    await this.consumer.subscribe<CommandMessage<any>>(
      { topics, fromBeginning: true },
      async (topic, message) => {
        const commandName = topic.replace(MessagingCommandSubscriber.NOMENCLATURE, '');

        const command = this.commands.get(commandName);

        if (!command) return this.logger.debug(`No handler found for '${commandName}'`);

        this.logger.debug(`Handle : ${commandName}`);

        try {
          await command.handler.execute(this.reconstructClass(command.instance, message.payload));

          await this.publisher.publishReply({}, message);
        } catch (error) {
          if (error instanceof ConflictException) throw error;

          this.logger.error(`${commandName} : ${error}`);
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
