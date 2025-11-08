import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './shared/modules/user.module';
import { MessagingModule } from './shared/messaging/messaging.module';
import { validateEnvironment } from './shared/config/environment';
import { PrismaModule } from './shared/prisma/prisma.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreModule } from './shared/event-store/event-store.module';
import { OutboxModule } from './shared/outbox/outbox.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: (config) => validateEnvironment(config),
    }),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    PrismaModule,
    MessagingModule,
    EventStoreModule,
    UserModule,
    OutboxModule,
  ],
})
export class AppModule {}
