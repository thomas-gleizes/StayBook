import { Global, Module } from '@nestjs/common';
import { Serializer } from './serializer.service';

@Global()
@Module({ providers: [Serializer], exports: [Serializer] })
export class SerializerModule {}
