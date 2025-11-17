import { UserCreatedEvent } from '../events/users/user-created.event';
import { AggregateRoot } from '../../core/interface/aggregate-root';
import { UserId } from '../values-object/user-id';
import { UserEditedEvent } from '../events/users/user-edited.event';

export type UserCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export type UserEditInput = {
  firstName: string;
  lastName: string;
};

export class UserAggregate extends AggregateRoot {
  private _id: UserId;
  private _firstName: string;
  private _lastName: string;
  private _email: string;

  static create(userId: UserId, input: UserCreateInput): UserAggregate {
    const aggregate = new UserAggregate();

    aggregate.apply(new UserCreatedEvent(userId.getValue(), input.firstName, input.lastName, input.email));

    return aggregate;
  }

  onUserCreatedEvent(event: UserCreatedEvent) {
    this._id = new UserId(event.userId);
    this._lastName = event.lastName;
    this._firstName = event.firstName;
    this._email = event.email;
  }

  edit(input: UserEditInput) {
    this.apply(new UserEditedEvent(this._id.getValue(), input.firstName, input.lastName));
  }

  onUserEditedEvent(event: UserEditedEvent) {
    this._lastName = event.lastName;
    this._firstName = event.firstName;
  }

  getAggregateType(): string {
    return 'User';
  }

  getAggregateId(): string {
    return this._id.getValue();
  }

  getId(): UserId {
    return this._id;
  }

  getFirstName(): string {
    return this._firstName;
  }

  getLastName(): string {
    return this._lastName;
  }

  getEmail(): string {
    return this._email;
  }
}
