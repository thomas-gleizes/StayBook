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
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserBodyDto } from './dtos/input/create-user-body.dto';
import { APP_NAME, ORG_NAME } from '../core/config/constants';
import { UsersResponseDto } from './dtos/output/users-response.dto';
import { EditUserBodyDto } from './dtos/input/edit-user-body.dto';

@Controller()
@ApiTags('UserManagement')
export class UserManagementController {
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
    const topic = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1.command.CreateUserCommand`;
  }

  @Patch('users/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiAcceptedResponse()
  async edit(@Param('id') userId: string, @Body() body: EditUserBodyDto) {
    const topic = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1.command.EditUserCommand`;
  }

  @Get('/users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiOkResponse()
  async findById(@Param('id') userId: string) {
    const topic = `${ORG_NAME}.${APP_NAME}.Modules.UserManagement.v1.query.FindUserQuery`;
  }
}
