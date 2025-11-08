import { AggregateRoot } from '@nestjs/cqrs';
import { BaseEvent } from './base-event.interface';

export abstract class BaseAggregateRoot<TBase extends BaseEvent = BaseEvent> extends AggregateRoot<TBase> {
  private version = 0;

  getVersion() {
    return this.version;
  }

  loadFromHistory(history: TBase[]) {
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
