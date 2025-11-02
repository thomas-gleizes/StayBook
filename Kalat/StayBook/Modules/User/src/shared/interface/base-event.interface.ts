export abstract class BaseEvent {
  protected constructor(public readonly occurredAt: Date) {}
}
