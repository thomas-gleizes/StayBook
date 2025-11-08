import { UserCreatedEvent } from '../events/users/user-created.event';
import { BaseAggregateRoot } from '../../shared/interface/base-aggregate-root';
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

export type UserState = {
  id: UserId;
  firstName: string;
  lastName: string;
  email: string;
};

export type UserSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export class UserAggregate extends BaseAggregateRoot {
  protected constructor(protected state: UserState) {
    super();
  }

  static create(userId: UserId, input: UserCreateInput): UserAggregate {
    const aggregate = new UserAggregate({
      id: userId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    });

    const snapshot = aggregate.takeSnapshot();

    aggregate.apply(new UserCreatedEvent(snapshot.id, snapshot.firstName, snapshot.lastName, snapshot.email));

    return aggregate;
  }

  edit(input: UserEditInput) {
    this.state.firstName = input.firstName;
    this.state.lastName = input.lastName;

    const snapshot = this.takeSnapshot();

    this.apply(new UserEditedEvent(snapshot.id, snapshot.firstName, snapshot.lastName));
  }

  static fromSnapshot(snapshot: UserSnapshot) {
    return new UserAggregate({
      id: UserId.fromSnapshot(snapshot.id),
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      email: snapshot.email,
    });
  }

  static createEmpty() {
    return new UserAggregate({ id: new UserId(''), firstName: '', lastName: '', email: '' });
  }

  onUserCreatedEvent(event: UserCreatedEvent) {
    this.state.id = new UserId(event.userId);
    this.state.lastName = event.lastName;
    this.state.firstName = event.firstName;
    this.state.email = event.email;
  }

  onUserEditedEvent(event: UserEditedEvent) {
    this.state.lastName = event.lastName;
    this.state.firstName = event.firstName;
  }

  takeSnapshot(): UserSnapshot {
    return {
      id: this.state.id.takeSnapshot(),
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
    };
  }

  getAggregateType(): string {
    return 'User';
  }

  getAggregateId(): string {
    return this.state.id.takeSnapshot();
  }
}
