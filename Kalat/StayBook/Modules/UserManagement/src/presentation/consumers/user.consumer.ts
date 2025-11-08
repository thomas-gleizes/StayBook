import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICE_NOMENCLATURE } from '../../shared/config/constants';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { CommandMessage } from '../../shared/messaging/messaging.interface';
import { EditUserCommand } from '../../application/commands/edit-user/edit-user.command';

@Controller()
export class UserConsumer {
  private logger = new Logger('USER CONSUMER');

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(`${SERVICE_NOMENCLATURE}.command.User`)
  async createUser(@Payload() message: CommandMessage<any>) {
    try {
      this.logger.debug(message);

      switch (message.content_type) {
        case `${SERVICE_NOMENCLATURE}.command.CreateUser`:
          await this.commandBus.execute(new CreateUserCommand(message.payload));
          break;
        case `${SERVICE_NOMENCLATURE}.command.EditUser`:
          // eslint-disable-next-line @typescripteslint/no-unsafe-member-access
          await this.commandBus.execute(new EditUserCommand(message.payload.userId, message.payload.input));
          break;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
