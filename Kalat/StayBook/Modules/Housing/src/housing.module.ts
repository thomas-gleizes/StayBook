import { Module } from '@nestjs/common';
import { HousingConsumer } from './infrastructure/consumer/housing.consumer';
import { KafkaModule } from './core/kafka/kafka.module';
import { CqrsModule } from '@nestjs/cqrs';
import { housingCommands } from './application/commands';

@Module({
  imports: [KafkaModule, CqrsModule.forRoot()],
  controllers: [HousingConsumer],
  providers: [...housingCommands],
})
export class HousingModule {}
