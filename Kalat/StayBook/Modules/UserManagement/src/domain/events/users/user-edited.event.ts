import { BaseEvent } from 'src/core/interface/base-event.interface';

export class UserEditedEvent extends BaseEvent {
  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super();
  }
}
