import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { KafkaProducer } from '../shared/kafka/kafka.producer';
import { CommandReplyMessage } from '../shared/kafka/kafka-message.interface';
import { CreateUserBodyDto } from './dtos/input/create-user-body.dto';
import { SERVICE_NOMENCLATURE } from '../shared/config/constants';

@Controller()
export class UserController {
  constructor(private readonly producer: KafkaProducer) {}

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiOkResponse({ schema: {} })
  @Get('users')
  async get() {}

  @Post('users')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiAcceptedResponse()
  async create(@Body() body: CreateUserBodyDto) {
    const topic = `${SERVICE_NOMENCLATURE}.command.CreateUser`;

    const command: CommandReplyMessage = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: body.toMessage(),
      content_type: topic,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
    };

    await this.producer.produce<CommandReplyMessage>(
      topic,
      command,
      command.correlation_id,
    );
  }
}
