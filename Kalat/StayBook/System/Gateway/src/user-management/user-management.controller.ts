import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { KafkaProducer } from '../shared/kafka/kafka.producer';
import {
  CommandMessage,
  QueryMessage,
} from '../shared/kafka/kafka-message.interface';
import { CreateUserBodyDto } from './dtos/input/create-user-body.dto';
import {
  APP_NAME,
  ORG_NAME,
  SERVICE_NOMENCLATURE,
} from '../shared/config/constants';
import { UsersResponseDto } from './dtos/output/users-response.dto';
import { EditUserBodyDto } from './dtos/input/edit-user-body.dto';

@Controller()
export class UserManagementController {
  constructor(private readonly producer: KafkaProducer) {}

  @Get('users')
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiOkResponse({ type: UsersResponseDto })
  get() {
    return { records: [], total: 0 };
  }

  @Post('users')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiAcceptedResponse()
  async create(@Body() body: CreateUserBodyDto) {
    const base = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1alpha.command.CreateUserCommand`;

    const command: CommandMessage<any> = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: body.toMessage(),
      content_type: base,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
      reply_to: `${base}.reply`,
    };

    await this.producer.produce<CommandMessage<any>>(
      base,
      command,
      command.correlation_id,
    );
  }

  @Patch('users/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiAcceptedResponse()
  async edit(@Param('id') userId: string, @Body() body: EditUserBodyDto) {
    const topic = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1alpha.command.EditUserCommand`;

    const command: CommandMessage<any> = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: {
        userId: userId,
        input: body.toMessage(),
      },
      content_type: topic,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
      reply_to: `${topic}.reply`,
    };

    await this.producer.produce<CommandMessage<any>>(topic, command, userId);
  }

  @Get('/users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiOkResponse()
  async findById(@Param('id') userId: string) {
    const topic = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1alpha.query.FindUserQuery`;

    const query: QueryMessage<any> = {
      id: randomUUID(),
      correlation_id: randomUUID(),
      payload: {
        userId: userId,
      },
      content_type: topic,
      metadata: {
        tenant_id: randomUUID(),
      },
      created_by: SERVICE_NOMENCLATURE,
      created_at: new Date().toISOString(),
      reply_to: `${topic}.reply`,
    };

    await this.producer.produce<QueryMessage<any>>(topic, query, userId);
  }
}
