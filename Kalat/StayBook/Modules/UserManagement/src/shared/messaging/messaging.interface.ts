import { BaseEvent } from '../interface/base-event.interface';

export interface BaseMessage {
  id: string;
  content_type: string;
  created_at: string;
  created_by: string;
  metadata: object;
}

export interface DomainEvent<Event extends BaseEvent = any> extends BaseMessage {
  state: Event;
  aggregate_id: string;
  aggregate_type: string;
  version: number;
}
