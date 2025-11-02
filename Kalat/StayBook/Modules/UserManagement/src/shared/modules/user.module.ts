import { Module } from '@nestjs/common';
import { UserCommandRepository } from '../../infrascture/repositories/user-command.repository';
import { USER_COMMAND_REPOSITORY } from '../../domain/repostiories/user-command.repostiory';
import { UserConsumer } from '../../presentation/consumers/user.consumer';

@Module({
  controllers: [UserConsumer],
  providers: [
    {
      provide: USER_COMMAND_REPOSITORY,
      useClass: UserCommandRepository,
    },
  ],
})
export class UserModule {}
