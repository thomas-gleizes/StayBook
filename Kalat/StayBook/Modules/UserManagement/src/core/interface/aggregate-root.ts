import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { BaseEvent } from './base-event.interface';

export abstract class AggregateRoot<TBase extends BaseEvent = BaseEvent> extends NestAggregateRoot<TBase> {
  private version = 0;

  getVersion() {
    return this.version;
  }

  loadFromHistory(history: TBase[]) {
    console.log('History', history);
    super.loadFromHistory(history);

    this.version += history.length;
  }

  commit() {
    super.commit();

    this.version += this.getUncommittedEvents().length;
  }

  abstract getAggregateType(): string;
  abstract getAggregateId(): string;
}
