import { BaseEvent } from '../interface/base-event.interface';
import { s } from '@faker-js/faker/dist/airline-DF6RqYmq';

export type RawData = { [key: string]: string | number | boolean | RawData | RawData[] };

export interface RawBaseMessage {
  id: string;
  content_type: string;
  created_at: string;
  created_by: string;
  metadata: object;
}

export interface BaseMessage {
  id: string;
  contentType: string;
  createdAt: Date;
  createdBy: string;
  metadata: object;
}

export interface RawDomainEvent extends RawBaseMessage {
  state: RawData;
  aggregate_id: string;
  aggregate_type: string;
  version: number;
}

export interface DomainEvent<Event extends BaseEvent = BaseEvent> extends BaseMessage {
  state: Event;
  aggregateId: string;
  aggregateType: string;
  version: number;
}

export interface RawActionMessage extends BaseMessage {
  correlation_id: string;
  payload: RawData;
  reply_to: string;
}

export interface ActionMessage<Payload = unknown> extends BaseMessage {
  correlationId: string;
  payload: Payload;
  replyTo: string;
}

export type CommandMessage<Payload> = ActionMessage<Payload>;
export type QueryMessage<Payload> = ActionMessage<Payload>;

export interface ReplyMessage<Payload> extends BaseMessage {
  correlationId: string;
  payload: Payload;
}

export interface RawReplyMessage extends RawBaseMessage {
  correlationId: string;
  payload: RawData;
}

export interface ErrorMessage extends BaseMessage {
  error: string;
  message: string;
  correlationId: string;
}

export interface RawErrorMessage extends RawBaseMessage {
  error: string;
  message: string;
  correlation_id: string;
}
