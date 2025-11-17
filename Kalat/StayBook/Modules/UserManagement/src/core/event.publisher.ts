import { IEvent, AsyncContext } from '@nestjs/cqrs';
import { IEventPublisher } from '@nestjs/cqrs/dist/interfaces/events/event-publisher.interface';

export class EventPublisher implements IEventPublisher {
  publish<TEvent extends IEvent>(event: TEvent, dispatcherContext?: unknown, asyncContext?: AsyncContext) {
    console.log('Event', event);
    throw new Error('Method not implemented.');
  }
  publishAll?<TEvent extends IEvent>(
    events: TEvent[],
    dispatcherContext?: unknown,
    asyncContext?: AsyncContext,
  ) {
    console.log('Events', events);
    throw new Error('Method not implemented.');
  }
}
