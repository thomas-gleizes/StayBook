import { AggregateRoot } from '@nestjs/cqrs';
import { HousingId } from '../value-object/housing-id';
import { HousingCreatedEvent } from '../events/housing-created.event';

export class HousingAggregate extends AggregateRoot {
  private _id: HousingId;

  static create(id: HousingId) {
    this.apply(new HousingCreatedEvent(id.getValue()));
  }

  onHousingCreatedEvent(event: HousingCreatedEvent) {
    this._id = new HousingId(event.housingId);
  }
}
