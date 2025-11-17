import { ConflictException, Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/utils/constants';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage } from '../messaging.interface';
import { InboxService } from '../../inbox/inbox.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingCommandSubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<ICommand>; handler: ICommandHandler }>();

  private static NOMENCLATURE = `${SERVICE_FQN}.command.`;

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly inbox: InboxService,
    private readonly prisma: PrismaService,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
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
        try {
          await this.prisma.$transaction(async (transaction) => {
            await this.inbox.saveCommand(transaction, [message]);
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
