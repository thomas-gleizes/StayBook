export type RawData = {
  [key: string]: string | number | boolean | RawData | RawData[];
};

export type RawMetadata = {
  [key: string]: string | number | boolean;
};

export interface RawBaseMessage {
  id: string;
  contentType: string;
  createdAt: string;
  createdBy: string;
  metadata: string;
  payload: Buffer;
}

export interface BaseMessage<T = unknown> {
  id: string;
  contentType: string;
  createdAt: Date;
  createdBy: string;
  metadata: RawMetadata;
  payload: T;
}

export interface RawDomainEvent extends RawBaseMessage {
  aggregateId: string;
  aggregateType: string;
  content: Buffer;
  version: number;
}

export interface DomainEvent<TEvent = unknown> extends BaseMessage<TEvent> {
  aggregateId: string;
  aggregateType: string;
  version: number;
}

export interface RawActionMessage extends RawBaseMessage {
  correlationId: string;
  replyTo: string;
}

export interface ActionMessage<Payload = unknown> extends BaseMessage<Payload> {
  correlationId: string;
  replyTo: string;
}

export type CommandMessage<Payload = unknown> = ActionMessage<Payload>;
export type QueryMessage<Payload = unknown> = ActionMessage<Payload>;

export interface ReplyMessage<Payload = unknown> extends BaseMessage<Payload> {
  correlationId: string;
}

export interface RawReplyMessage extends RawBaseMessage {
  correlationId: string;
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
