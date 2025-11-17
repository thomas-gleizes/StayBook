import { BaseEvent } from '../interface/base-event.interface';
import { Injectable, SetMetadata } from '@nestjs/common';
import { DomainEvent } from '../messaging/messaging.interface';

export const PROJECTION_HANDLER_METADATA = 'PROJECTION_HANDLER_METADATA';

export function Projection<T extends BaseEvent>(eventClass: new (...args: any[]) => T) {
  return (target: any) => {
    Injectable()(target);

    SetMetadata(PROJECTION_HANDLER_METADATA, eventClass)(target);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return target;
  };
}

export interface IProjectionHandler<Event extends BaseEvent> {
  handle(event: DomainEvent<Event>): Promise<void>;
}
