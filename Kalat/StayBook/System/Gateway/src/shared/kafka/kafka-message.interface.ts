export type MessagePayload = {
  [key: string]: string | number | boolean | MessagePayload | MessagePayload[];
};

export type MessageMetadata = { [key: string]: string };

export interface Message<
  Payload extends MessagePayload = MessagePayload,
  Metadata extends MessageMetadata = MessageMetadata,
> {
  id: string;
  content_type: string;
  payload: Payload;
  metadata: Metadata;
  created_by: string;
  created_at: string;
}

export interface CommandMessage<
  Payload extends MessagePayload = MessagePayload,
  Metadata extends MessageMetadata = MessageMetadata,
> extends Message<Payload, Metadata> {
  correlation_id: string;
  replyTo: string;
}

export interface CommandReplyMessage<
  Payload extends MessagePayload = MessagePayload,
  Metadata extends MessageMetadata = MessageMetadata,
> extends Message<Payload, Metadata> {
  correlation_id: string;
}
