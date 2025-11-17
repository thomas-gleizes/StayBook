export abstract class BaseEvent {
  public readonly occurredAt = new Date().toISOString();
}
