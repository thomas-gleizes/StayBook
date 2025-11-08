import { OutboxService } from './outbox.service';
import { Cron, Interval } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { environment } from '../config/environment';

@Injectable()
export class OutboxProcessor {
  private readonly isEnable: boolean = true;
  private isProcessing: boolean = false;

  private readonly logger = new Logger('OUTBOX PROCESSOR');

  constructor(
    private readonly outbox: OutboxService,
    private readonly config: ConfigService,
  ) {
    this.isEnable = this.config.getOrThrow<boolean>('OUTBOX', true);

    if (this.isEnable) {
      this.logger.log(`Outbox setup with ${environment.OUTBOX_INTERVAL_MS}ms`);
    }
  }

  @Interval(environment.OUTBOX_INTERVAL_MS)
  async processMessages() {
    if (!this.isEnable) return;
    if (this.isProcessing) return this.logger.warn('ALREADY PROCESSING');

    this.isProcessing = true;
    await this.outbox.processEvent();
    this.isProcessing = false;
  }

  @Cron('*/5 * * * *')
  async clearMessage() {
    await this.outbox.clearMessages();
  }
}
