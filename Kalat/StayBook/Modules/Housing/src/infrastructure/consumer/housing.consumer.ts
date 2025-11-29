import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICE_FQN } from '../../core/config/constants';
import { CreateHousing } from '../../application/commands/create-housing/create-housing.command';
import { HousingCreatedEvent } from '../../domain/events/housing-created.event';
import { CommandBus } from '@nestjs/cqrs';
import { CommandMessage } from '@staybook/serializer';

@Controller()
export class HousingConsumer {
  private readonly logger = new Logger(HousingConsumer.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(`${SERVICE_FQN}.command.CreateHousing`)
  async createHousing(@Payload() message: CommandMessage<CreateHousing>) {
    const id = await this.commandBus.execute(message.payload);

    return { id };
  }

  @EventPattern(`${SERVICE_FQN}.domain.HousingCreated`)
  async housingProjection(@Payload() message: CommandMessage<HousingCreatedEvent>) {
    this.logger.log('Housing created', message);
  }
}
