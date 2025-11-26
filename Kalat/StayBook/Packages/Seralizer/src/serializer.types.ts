export type RawData = {
  [key: string]: string | number | boolean | RawData | RawData[];
};

export interface RawBaseMessage {
  id: string;
  contentType: string;
  createdAt: string;
  createdBy: string;
  metadata: string;
}

export interface BaseMessage {
  id: string;
  contentType: string;
  createdAt: Date;
  createdBy: string;
  metadata: object;
}

export interface RawDomainEvent extends RawBaseMessage {
  aggregateId: string;
  aggregateType: string;
  content: Buffer;
  version: number;
}

export interface DomainEvent<TEvent> extends BaseMessage {
  aggregateId: string;
  aggregateType: string;
  content: TEvent;
  version: number;
}

export interface RawActionMessage extends RawBaseMessage {
  correlationId: string;
  payload: Buffer;
  replyTo: string;
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
  payload: Buffer;
}

export interface ErrorMessage extends BaseMessage {
  error: string;
  message: string;
  correlationId: string;
}

export interface RawErrorMessage extends RawBaseMessage {
  error: string;
  message: string;
  correlationId: string;
}
