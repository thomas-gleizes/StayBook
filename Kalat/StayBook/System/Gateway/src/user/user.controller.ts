import { Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class UserController {
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiOkResponse({ schema: {} })
  @Get('users')
  async get() {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiOkResponse({ schema: {} })
  @Post('users')
  async create() {}
}
