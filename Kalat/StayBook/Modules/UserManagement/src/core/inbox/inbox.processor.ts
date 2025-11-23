import { Injectable } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { Lockable, LockerService } from '../locker/locker.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class InboxProcessor {
  constructor(
    private readonly inbox: InboxService,
    private readonly locker: LockerService,
  ) {}

  @Interval(5000)
  async processMessage() {
    // await this.inbox.processMessages();
  }

  @Interval(1000)
  async processEvents() {
    // await this.locker.run(Lockable.OUTBOX_PROCESS, () => this.inbox.processEvent());
  }
}
