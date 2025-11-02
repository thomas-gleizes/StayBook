import { UserAggregate } from 'src/domain/aggregates/user-aggregate';
import { IUserCommandRepository } from '../../domain/repostiories/user-command.repostiory';

export class UserCommandRepository implements IUserCommandRepository {
  findById(id: string) {
    throw new Error('Method not implemented.');
  }

  persist(aggregate: UserAggregate) {
    const events = aggregate.getUncommittedEvents();

    console.log('Events', events);
  }
}
