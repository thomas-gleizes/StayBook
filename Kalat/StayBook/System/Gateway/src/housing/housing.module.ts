import { Module } from '@nestjs/common';
import { HousingController } from './housing.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICE_FQN } from '../core/config/constants';
import { environment } from '../core/config/environment';
import { KafkaSerializer } from '../core/kafka/kafka-serializer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_BROKER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: SERVICE_FQN,
            brokers: environment.KAFKA_BROKERS,
          },
          serializer: new KafkaSerializer(environment.SCHEMA_REGISTER_URL),
        },
      },
    ]),
  ],
  controllers: [HousingController],
})
export class HousingModule {}
