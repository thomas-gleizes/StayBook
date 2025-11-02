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
import {
  APP_NAME,
  ORG_NAME,
  SERVICE_NOMENCLATURE,
} from '../shared/config/constants';
import { UsersResponseDto } from './dtos/output/users-response.dto';

@Controller()
export class UserManagementController {
  constructor(private readonly producer: KafkaProducer) {}

  @Get('users')
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiOkResponse({ type: UsersResponseDto })
  async get() {
    const base = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.query`;

    const query: CommandReplyMessage = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: {
        offset: 0,
        limit: 10,
      },
      content_type: `${base}.GetUsers`,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
    };

    await this.producer.produce(`${base}.User`, query, query.correlation_id);

    return { records: [], total: 0 };
  }

  @Post('users')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiAcceptedResponse()
  async create(@Body() body: CreateUserBodyDto) {
    const base = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.command`;

    const command: CommandReplyMessage = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: body.toMessage(),
      content_type: `${base}.CreateUser`,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
    };

    await this.producer.produce<CommandReplyMessage>(
      `${base}.User`,
      command,
      command.correlation_id,
    );
  }
}
