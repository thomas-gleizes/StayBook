import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './core/modules/user.module';
import { MessagingModule } from './core/messaging/messaging.module';
import { validateEnvironment } from './core/config/environment';
import { PrismaModule } from './core/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreModule } from './core/event-store/event-store.module';
import { OutboxModule } from './core/outbox/outbox.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LockerModule } from './core/locker/locker.module';
import { InboxModule } from './core/inbox/inbox.module';
import { SerializerModule } from './core/seralizer/serializer.module';
import { ProjectionModule } from './core/projections/projection.module';
import { RegistererModule } from './core/registerer/registerer.module';
import { EventPublisher } from './core/event.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnvironment(config),
    }),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot({ eventPublisher: new EventPublisher() }),
    RegistererModule,
    PrismaModule,
    MessagingModule,
    EventStoreModule,
    UserModule,
    OutboxModule,
    InboxModule,
    LockerModule,
    SerializerModule,
    ProjectionModule,
  ],
})
export class AppModule {}
