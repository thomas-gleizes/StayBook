import { Module } from '@nestjs/common';
import { UserCommandRepository } from '../../infrascture/repositories/user-command.repository';
import { USER_COMMAND_REPOSITORY } from '../../domain/repostiories/user-command.repostiory';
import { UserConsumer } from '../../presentation/consumers/user.consumer';
import { usersCommandHanders } from '../../application/commands';
import { CqrsModule } from '@nestjs/cqrs';
import { IDENTIFIANT_GENERATOR } from '../../domain/ports/identifiant-generator.port';
import { RandomUuidGeneratorAdapter } from '../../infrascture/adapters/random-uuid-generator.adapter';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [CqrsModule],
  controllers: [UserConsumer],
  providers: [
    ...usersCommandHanders,
    {
      provide: USER_COMMAND_REPOSITORY,
      useClass: UserCommandRepository,
    },
    {
      provide: IDENTIFIANT_GENERATOR,
      useClass: RandomUuidGeneratorAdapter,
    },
  ],
})
export class UserModule {}
