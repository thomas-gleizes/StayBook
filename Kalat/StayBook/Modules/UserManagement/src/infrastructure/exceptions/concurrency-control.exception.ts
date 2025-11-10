import { InfrastructureException } from './infrastructureException';

export class ConcurrencyControlException extends InfrastructureException {
  constructor(expect: number, current: number) {
    super(`Concurrency exception : expect(${expect}) - current(${current})`);
  }
}
