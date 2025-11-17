import { Identifiant } from './identifiant';

export class UserId extends Identifiant {
  static create(value: string) {
    return new UserId(`user-${value}`);
  }

  static fromString(value: string) {
    return new UserId(value);
  }
}
