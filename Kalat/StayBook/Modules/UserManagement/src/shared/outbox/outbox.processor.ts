import { OutboxService } from './outbox.service';
import { Cron, Interval } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { environment } from '../config/environment';
import { Lockable, LockerService } from '../locker/locker.service';

@Injectable()
export class OutboxProcessor {
  private readonly isEnable: boolean = true;

  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly outbox: OutboxService,
    private readonly config: ConfigService,
    private readonly locker: LockerService,
  ) {
    this.isEnable = this.config.getOrThrow<boolean>('OUTBOX', true);

    if (this.isEnable) {
      this.logger.log(`Outbox setup with ${environment.OUTBOX_INTERVAL_MS}ms`);
    }
  }

  @Interval(environment.OUTBOX_INTERVAL_MS)
  async processMessages() {
    if (!this.isEnable) return;

    const lock = await this.locker.lock(Lockable.OUTBOX).catch(() => this.logger.verbose('Process lock'));

    if (!lock) return;

    try {
      await this.outbox.processEvent();
    } catch (error) {
      this.logger.error('ERROR WHEN PROCESSING OUTBOX', error);
    } finally {
      await this.locker.release(Lockable.OUTBOX);
    }
  }

  @Cron('*/5 * * * *')
  async clearMessage() {
    await this.outbox.clearMessages();
  }
}
