import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from '../../../shared/config/environment';
import { EventStoreModule } from '../../../shared/event-store/event-store.module';
import { OutboxModule } from '../../../shared/outbox/outbox.module';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { MessagingModule } from '../../../shared/messaging/messaging.module';
import { UserCommandRepository } from '../../repositories/user-command.repository';
import { RedisModule } from '../../../shared/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => validateEnvironment(config) }),
    EventStoreModule,
    CqrsModule,
    RedisModule,
    OutboxModule,
    PrismaModule,
    MessagingModule,
  ],
  providers: [UserCommandRepository],
})
export class UserSeedingModule {}
