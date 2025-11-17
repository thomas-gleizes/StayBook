import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ReflectableDecorator } from '@nestjs/core/services/reflector.service';

export type Result<T> = [InstanceWrapper, T];

@Injectable()
export class RegistererService {
  constructor(
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
  ) {}

  findByMetadata<T = unknown>(metadata: unknown): Result<T>[] {
    const tmp: Result<T>[] = [];
    const providers = this.discoveryService.getProviders();

    for (const provider of providers) {
      if (provider.metatype) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const find = this.reflector.get(metadata, provider.metatype);

        if (find) {
          tmp.push([provider, find]);
        }
      }
    }

    return tmp;
  }
}
