import { DomainEvent } from '../messaging/messaging.interface';
import { OutboxMessage, OutboxType, Prisma } from '../../../generated/prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { MessagingPublisher } from '../messaging/messaging.publisher';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger('OUTBOX');

  constructor(
    private readonly publisher: MessagingPublisher,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async saveEvents(transaction: Prisma.TransactionClient, events: DomainEvent[]) {
    await transaction.outboxMessage.createMany({
      data: events.map<Prisma.OutboxMessageCreateManyInput>((event) => ({
        id: event.id,
        message: JSON.stringify(event),
        topic: event.aggregate_type,
        type: 'EVENT',
        status: 'PENDING',
      })),
    });
  }

  private reserveMessages(...types: OutboxType[]): Promise<OutboxMessage[]> {
    return this.prisma.$transaction(async (transaction) => {
      const filters: Prisma.OutboxMessageWhereInput = {
        type: { in: types },
        OR: [
          { status: 'PENDING' },
          { status: 'PROCESSING', startProcessingAt: { lte: new Date(Date.now() - 30_000) } },
          {
            status: 'FAILED',
            startProcessingAt: { lte: new Date(Date.now() - 30_000) },
            retry: { lte: this.config.get<number>('OUTBOX_MAX_RETRY', 5) },
          },
        ],
      };

      const events = await transaction.outboxMessage.findMany({
        where: filters,
        take: this.config.get<number>('OUTBOX_BATCH_SIZE', 5),
      });

      if (!events.length) return [];

      const ids = events.map((event) => event.id);

      const result = await transaction.outboxMessage.updateMany({
        where: {
          ...filters,
          id: { in: ids },
        },
        data: {
          status: 'PROCESSING',
          startProcessingAt: new Date(),
        },
      });

      if (!result.count) {
        this.logger.verbose('RACE CONDITION DETECTED');
        return [];
      }

      return transaction.outboxMessage.findMany({ where: { id: { in: ids }, status: 'PROCESSING' } });
    });
  }

  async processEvent() {
    const events = await this.reserveMessages('EVENT').catch(() => []);
    const count = await this.prisma.outboxMessage.count({ where: { status: 'PENDING' } });

    if (!events.length) return this.logger.verbose('No events to process');

    this.logger.verbose(`process ${events.length} event on ${count}`);

    for (const event of events) {
      try {
        const message = JSON.parse(event.message) as DomainEvent;

        await this.markMessageAsProcessed(event);
        await this.publisher.publishEvent([message]);
      } catch (error) {
        this.logger.error(`failed to error ${error}`);
        await this.markMessageAsFailed(event, error);
        break;
      }
    }
  }

  async markMessageAsProcessed(event: OutboxMessage) {
    await this.prisma.outboxMessage.update({
      where: { id: event.id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  async markMessageAsFailed(event: OutboxMessage, error: Error) {
    await this.prisma.outboxMessage.update({
      where: { id: event.id },
      data: { status: 'FAILED', message: error.message, retry: { increment: 1 } },
    });
  }

  async clearMessages() {
    const keepIds = await this.prisma.outboxMessage.findMany({
      where: { status: 'PROCESSED' },
      orderBy: { processedAt: 'desc' },
      select: { id: true },
      take: this.config.get<number>('OUTBOX_KEEP_PROCESSED_COUNT', 100),
    });

    const result = await this.prisma.outboxMessage.deleteMany({
      where: {
        status: 'PROCESSED',
        id: { notIn: keepIds.map((item) => item.id) },
      },
    });

    this.logger.log(`${result.count} message was clear`);
  }
}
