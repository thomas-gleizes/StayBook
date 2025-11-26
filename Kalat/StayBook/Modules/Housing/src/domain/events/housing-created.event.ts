import { IEvent } from '@nestjs/cqrs';

export class HousingCreatedEvent implements IEvent {
  constructor(public readonly housingId: string) {}
}
