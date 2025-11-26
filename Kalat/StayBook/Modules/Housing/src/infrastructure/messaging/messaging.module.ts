import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../../core/config/environment';
import { SERVICE_FQN } from '../../core/config/constants';
import { MessagingService } from './messaging.service';
import { SerializerModule } from '@staybook/seralizer';

@Global()
@Module({
  imports: [
    SerializerModule.register({ registryUrl: environment.SCHEMA_REGISTER_URL }),
    ClientsModule.register([
      {
        name: 'MESSAGING_CONNECTION',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: SERVICE_FQN,
            brokers: environment.KAFKA_BROKERS,
          },
          consumer: {
            groupId: `${SERVICE_FQN}.CLIENT`,
          },
        },
      },
    ]),
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
