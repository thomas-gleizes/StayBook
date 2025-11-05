import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICE_NOMENCLATURE } from '../../shared/config/constants';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';

@Controller()
export class UserConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(`${SERVICE_NOMENCLATURE}.command.User`)
  async createUser(@Payload() message: any) {
    console.log('Message', message);

    await this.commandBus.execute(
      new CreateUserCommand({ firstName: 'HELO', lastName: 'HEFEf', email: 'EFEF' }),
    );
  }
}
