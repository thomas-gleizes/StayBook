import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from '../../../core/config/environment';
import { EventStoreModule } from '../../../core/event-store/event-store.module';
import { OutboxModule } from '../../../core/outbox/outbox.module';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { MessagingModule } from '../../../core/messaging/messaging.module';
import { UserCommandRepository } from '../../repositories/user-command.repository';
import { LockerModule } from '../../../core/locker/locker.module';
import { SerializerModule } from '../../../core/seralizer/serializer.module';
import { InboxModule } from '../../../core/inbox/inbox.module';
import { EventPublisher } from '../../../core/event.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => validateEnvironment(config) }),
    EventStoreModule,
    CqrsModule.forRoot({ eventPublisher: new EventPublisher() }),
    OutboxModule,
    LockerModule,
    PrismaModule,
    MessagingModule,
    SerializerModule,
    InboxModule,
  ],
  providers: [UserCommandRepository],
})
export class UserSeedingModule {}
