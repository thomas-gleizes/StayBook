import { BaseEvent } from '../interface/base-event.interface';

export interface BaseMessage {
  id: string;
  content_type: string;
  created_at: string;
  created_by: string;
  metadata: object;
}

export interface DomainEvent<Event extends BaseEvent = BaseEvent> extends BaseMessage {
  state: Event;
  aggregate_id: string;
  aggregate_type: string;
  version: number;
}

export interface ActionMessage<Payload = unknown> extends BaseMessage {
  correlation_id: string;
  payload: Payload;
  reply_to: string;
}

export type CommandMessage<Payload> = ActionMessage<Payload>;
export type QueryMessage<Payload> = ActionMessage<Payload>;

export interface ReplyMessage<Payload> extends BaseMessage {
  correlation_id: string;
  payload: Payload;
}

export interface ErrorMessage extends BaseMessage {
  error: string;
  message: string;
  correlation_id: string;
}
