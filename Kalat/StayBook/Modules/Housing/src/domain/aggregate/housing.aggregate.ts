import { AggregateRoot } from '@nestjs/cqrs';
import { HousingId } from '../value-object/housing-id';
import { HousingCreatedEvent } from '../events/housing-created.event';

export class HousingAggregate extends AggregateRoot {
  private _id: HousingId;

  getAggregateId(): string {
    return this._id.getValue();
  }

  constructor() {
    super();
  }

  static create(id: HousingId): HousingAggregate {
    const aggregate = new HousingAggregate();

    aggregate._id = id;

    this.apply(new HousingCreatedEvent(id.getValue()));

    return aggregate;
  }

  onHousingCreatedEvent(event: HousingCreatedEvent) {
    this._id = new HousingId(event.housingId);
  }
}
