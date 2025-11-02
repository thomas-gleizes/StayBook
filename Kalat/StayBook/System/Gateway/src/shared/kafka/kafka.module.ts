import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KAFKA_BROKER } from './kafka.token';
import { KafkaProducer } from './kafka.producer';
import { SERVICE_NOMENCLATURE } from '../config/constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_BROKER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: SERVICE_NOMENCLATURE,
              brokers: config.getOrThrow<string[]>('KAFKA_BROKERS'),
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaProducer],
  exports: [ClientsModule, KafkaProducer],
})
export class KafkaModule {}
