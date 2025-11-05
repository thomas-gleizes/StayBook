import { AggregateRoot } from '@nestjs/cqrs';
import { BaseEvent } from './base-event.interface';

export abstract class BaseAggregateRoot extends AggregateRoot<BaseEvent> {
  abstract getAggregateType(): string;
  abstract getAggregateId(): string;
}
