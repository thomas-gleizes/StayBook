export interface BaseMessage {
  id: string;
  content_type: string;
  created_at: string;
  created_by: string;
  metadata: object;
}

export interface CommandMessage<Payload> extends BaseMessage {
  correlation_id: string;
  payload: Payload;
  reply_to: string;
}

export interface QueryMessage<Payload> extends BaseMessage {
  correlation_id: string;
  payload: Payload;
  reply_to: string;
}

export interface ReplyMessage<Payload> extends BaseMessage {
  correlation_id: string;
  payload: Payload;
}

export interface ErrorMessage extends BaseMessage {
  error: string;
  message: string;
  correlation_id: string;
}
