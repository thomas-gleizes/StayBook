import { ValueObject } from '../../shared/interface/value-object';

export class UserId implements ValueObject {
  constructor(private readonly value: string) {}

  takeSnapshot(): string {
    return this.value;
  }

  static fromSnapshot(id: string) {
    return new UserId(id);
  }
}
