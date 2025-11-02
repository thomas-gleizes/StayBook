import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../events/user-created.event';

export type UserSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type UserCreateInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export class UserAggregate extends AggregateRoot {
  private snapshot: UserSnapshot;

  static create(input: UserCreateInput): UserAggregate {
    const aggregate = new UserAggregate();

    aggregate.apply(new UserCreatedEvent(input.id, input.firstName, input.lastName, input.email));

    return aggregate;
  }
}
