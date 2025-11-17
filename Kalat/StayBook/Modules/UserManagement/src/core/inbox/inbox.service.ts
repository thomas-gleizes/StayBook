import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InboxMessage, MessageStatus, MessageType, Prisma } from '../../../generated/prisma/client';
import {
  BaseMessage,
  CommandMessage,
  DomainEvent,
  QueryMessage,
  RawDomainEvent,
} from '../messaging/messaging.interface';
import { ConfigService } from '@nestjs/config';
import { ProjectionService } from '../projections/projection.service';
import { Serializer } from '../seralizer/serializer.service';

@Injectable()
export class InboxService {
  private readonly logger = new Logger('Inbox');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly projection: ProjectionService,
    private readonly serializer: Serializer,
  ) {}

  async saveMessages<Message extends BaseMessage>(
    transaction: Prisma.TransactionClient,
    messages: Message[],
    type: MessageType,
  ) {
    try {
      await transaction.inboxMessage.createMany({
        data: messages.map((message) => ({
          id: message.id,
          message: JSON.stringify(message),
          type: type,
          status: MessageStatus.PENDING,
        })),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // si duplication de l'id on assure l'idempotence en ignorant l'erreur

        this.logger.fatal('Error.code', error);
        process.exit(1);
        return;
      }

      throw error;
    }
  }

  async saveEvent(transaction: Prisma.TransactionClient, events: DomainEvent[]) {
    return this.saveMessages(transaction, events, MessageType.EVENT);
  }

  async saveCommand(transaction: Prisma.TransactionClient, commands: CommandMessage<any>[]) {
    return this.saveMessages(transaction, commands, MessageType.COMMAND);
  }

  async saveQuery(transaction: Prisma.TransactionClient, queries: QueryMessage<any>[]) {
    return this.saveMessages(transaction, queries, MessageType.QUERY);
  }

  async processMessages() {
    const messages = await this.reserveMessages('COMMAND');
  }

  async processEvent() {
    const events = await this.reserveMessages('EVENT');

    for (const event of events) {
      try {
        console.log('EVENT', event);

        const domainEvent = this.serializer.deserializeEvent(JSON.parse(event.message) as RawDomainEvent);

        await this.projection.execute(domainEvent);
      } catch (error) {
        this.logger.error(`Failed execute projection `, error);
      }
    }
  }

  async reserveMessages(type: MessageType): Promise<InboxMessage[]> {
    const batchSize = this.config.getOrThrow<number>('INBOX_BATCH_SIZE', 5);

    const rows = await this.prisma.$queryRaw<InboxMessage[]>`
      UPDATE inbox_messages
      SET status              = 'PROCESSING',
          start_processing_at = NOW(),
          type                = ${type}::"MessageType"
      WHERE id IN (
        SELECT id
        FROM inbox_messages
        WHERE status = 'PENDING'
         OR (status = 'FAILED'
        AND start_processing_at <= NOW() - INTERVAL '1 minutes')
         OR (status = 'PROCESSING'
        AND start_processing_at <= NOW() - INTERVAL '1 minutes')
        ORDER BY created_at ASC
        FOR
        UPDATE SKIP LOCKED
        LIMIT ${batchSize}) RETURNING *
    `;

    if (!rows.length) {
      this.logger.verbose('No inbox messages in pending');
      return [];
    }

    this.logger.verbose(`Process ${rows.length} message`);
    return rows;
  }
}
