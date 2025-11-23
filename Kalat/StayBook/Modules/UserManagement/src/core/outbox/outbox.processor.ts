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

    await this.locker.run(Lockable.OUTBOX_PROCESS, () => this.outbox.processEvent());
  }

  @Cron('*/1 * * * *')
  async clearMessage() {
    if (!this.isEnable) return;

    // await this.locker.run(Lockable.OUTBOX_CLEAR, () => this.outbox.clearMessages());
  }
}
