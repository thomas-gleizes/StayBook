import { AggregateRoot } from '../../core/interface/aggregate-root';

export interface CommandRepositoryPort<TAggregate extends AggregateRoot> {
  persist(aggregate: TAggregate): Promise<void>;

  findById(id: string): Promise<TAggregate | null>;
}
