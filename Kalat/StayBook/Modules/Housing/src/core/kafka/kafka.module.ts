import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICE_FQN } from '../config/constants';
import { environment } from '../config/environment';

@Global()
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
        },
      },
    ]),
  ],
})
export class KafkaModule {}
