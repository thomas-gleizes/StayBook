import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SERVICE_FQN } from '../../core/config/constants';

@Controller()
export class HousingConsumer {
  private readonly logger = new Logger(HousingConsumer.name);

  @MessagePattern(SERVICE_FQN + '.command.CreateHousingCommand')
  async createHousing() {
    this.logger.log('Create housing');
  }
}
