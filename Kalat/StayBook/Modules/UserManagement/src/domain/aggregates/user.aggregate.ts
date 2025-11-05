import { UserCreatedEvent } from '../events/user-created.event';
import { BaseAggregateRoot } from '../../shared/interface/base-aggregate-root';
import { UserId } from '../values-object/user-id';

export type UserCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export class UserAggregate extends BaseAggregateRoot {
  private _id: UserId;
  private _firstName: string;
  private _lastName: string;
  private _email: string;

  static create(userId: UserId, input: UserCreateInput): UserAggregate {
    const aggregate = new UserAggregate();

    aggregate._id = userId;
    aggregate._firstName = input.firstName;
    aggregate._lastName = input.lastName;
    aggregate._email = input.email;

    aggregate.apply(
      new UserCreatedEvent(
        aggregate._id.getValue(),
        aggregate._firstName,
        aggregate._lastName,
        aggregate._email,
      ),
    );

    return aggregate;
  }

  getAggregateType(): string {
    return 'User';
  }
  getAggregateId(): string {
    return this._id.getValue();
  }
}
