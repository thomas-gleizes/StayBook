import { AggregateRoot } from '@nestjs/cqrs';

export interface BaseCommandRepository<Aggregate extends AggregateRoot> {
  findById(id: string);

  persist(aggregate: Aggregate);
}
