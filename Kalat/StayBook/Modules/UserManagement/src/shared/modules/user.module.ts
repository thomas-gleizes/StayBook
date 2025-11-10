import { Module } from '@nestjs/common';
import { UserCommandRepository } from '../../infrastructure/repositories/user-command.repository';
import { USER_COMMAND_REPOSITORY } from '../../domain/repostiories/user-command.repostiory';
import { usersCommandHanders } from '../../application/commands';
import { IDENTIFIANT_GENERATOR } from '../../domain/ports/identifiant-generator.port';
import { RandomUuidGeneratorAdapter } from '../../infrastructure/adapters/random-uuid-generator.adapter';
import { eventHanders } from '../../application/events';
import { userQueryHandlers } from '../../application/queries';
import { USER_QUERY_REPOSITORY } from '../../domain/repostiories/user-query.repository';
import { UserQueryRepository } from '../../infrastructure/repositories/user-query.repository';

@Module({
  providers: [
    ...userQueryHandlers,
    ...usersCommandHanders,
    ...eventHanders,
    {
      provide: USER_QUERY_REPOSITORY,
      useClass: UserQueryRepository,
    },
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
