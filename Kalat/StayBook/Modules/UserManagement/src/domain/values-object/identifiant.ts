import { ValueObject } from '../../core/interface/value-object';

export class Identifiant extends ValueObject {
  constructor(protected readonly value: string) {
    super();
  }

  getValue() {
    return this.value;
  }

  equal<T extends Identifiant>(identifiant: T) {
    return this.getValue() === identifiant.getValue();
  }
}
