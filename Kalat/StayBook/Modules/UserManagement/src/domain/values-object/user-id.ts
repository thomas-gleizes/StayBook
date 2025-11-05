import { ValueObject } from '../../shared/interface/value-object';

export class UserId implements ValueObject {
  constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }
}
