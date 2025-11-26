import { DynamicModule, Global, Module } from "@nestjs/common";
import { Serializer } from "./serializer.service";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";

export type SerializerOptions = {
  registryUrl: string;
};

@Global()
@Module({})
export class SerializerModule {
  static register(options: SerializerOptions): DynamicModule {
    return {
      module: SerializerModule,
      providers: [
        {
          provide: "REGISTRY",
          useValue: new SchemaRegistry({ host: options.registryUrl }),
        },
        Serializer,
      ],
      exports: [Serializer],
    };
  }
}
