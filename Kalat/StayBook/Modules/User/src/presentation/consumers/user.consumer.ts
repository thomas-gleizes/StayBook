import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SERVICE_NOMENCLATURE } from '../../shared/config/constants';

@Controller()
export class UserConsumer {
  @MessagePattern(`${SERVICE_NOMENCLATURE}.command.User`)
  createUser(@Payload() message: any) {
    console.log('message', message);
  }
}
