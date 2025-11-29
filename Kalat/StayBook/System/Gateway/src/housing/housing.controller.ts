import { Controller, Get, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ActionMessage } from '@staybook/serializer';
import { randomUUID } from 'node:crypto';

const TOPICS = {
  createHousing: 'Kalat.StayBook.Modules.Housing.v1.command.CreateHousing',
} as const;

class CreateHousing {
  constructor(public readonly title: string) {}
}

@Controller()
@ApiTags('Housing')
export class HousingController implements OnModuleInit {
  private readonly logger = new Logger(HousingController.name);

  constructor(
    @Inject('KAFKA_BROKER')
    private readonly client: ClientKafka,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf(TOPICS.createHousing);
  }

  @Get('/housings')
  @ApiOperation({ summary: 'Create housing' })
  @ApiAcceptedResponse()
  async createHousing() {
    this.logger.log('Create housing');

    const command = new CreateHousing('Mon titre de housing');

    const message: ActionMessage<CreateHousing> = {
      id: randomUUID(),
      contentType: TOPICS.createHousing,
      correlationId: randomUUID(),
      createdAt: new Date(),
      createdBy: 'John Doe',
      metadata: { tenantId: randomUUID() },
      payload: command,
      replyTo: `${TOPICS.createHousing}.reply`,
    };

    const result = await firstValueFrom(
      this.client.send(TOPICS.createHousing, message),
    );

    console.log('result', result);

    return { result };
  }
}
