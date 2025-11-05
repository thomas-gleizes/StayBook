import { IdentifiantGeneratorPort } from '../../domain/ports/identifiant-generator.port';
import { randomUUID } from 'crypto';

export class RandomUuidGeneratorAdapter implements IdentifiantGeneratorPort {
  generate(): string {
    return randomUUID();
  }
}
