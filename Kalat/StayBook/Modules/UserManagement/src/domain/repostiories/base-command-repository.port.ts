import { BaseAggregateRoot } from '../../shared/interface/base-aggregate-root';

export interface CommandRepositoryPort<TAggregate extends BaseAggregateRoot> {
  persist(aggregate: TAggregate): Promise<void>;
}
