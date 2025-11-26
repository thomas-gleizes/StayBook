import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { ICommand, IQuery, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { SERVICE_FQN } from '../../config/constants';
import { CommandMessage, RawActionMessage } from '../messaging.interface';
import { QUERY_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { InboxService } from '../../inbox/inbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistererService } from '../../registerer/registerer.service';
import { Serializer } from '../../seralizer/serializer.service';
import { FindUserQuery } from '../../../application/queries/find-user/find-user.query';
import { MessagingPublisher } from '../messaging.publisher';
import errorMap from 'zod/v3/locales/en';

@Injectable()
export class MessagingQuerySubscriber implements OnModuleInit {
  private readonly logger = new Logger('Command Subscriber');
  private readonly commands = new Map<string, { instance: Type<IQuery>; handler: IQueryHandler }>();

  private static FQN = `${SERVICE_FQN}.query.`;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly serializer: Serializer,
    private readonly consumer: KafkaConsumer,
    private readonly registerer: RegistererService,
    private readonly publisher: MessagingPublisher,
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
      topics,
      { fromBeginning: true },
      async ({ topic, value, headers }) => {
        const parsedMessage = await this.serializer.deserializeQuery(value);

        this.logger.debug('QUERY HANDLE', topic, parsedMessage, headers);

        try {
          const result = await this.queryBus.execute(parsedMessage.payload);

          await this.publisher.publishReply(parsedMessage, result);
        } catch (e) {
          await this.publisher.publishReply(parsedMessage, { error: e.message });
        }
      },
    );
  }
}
