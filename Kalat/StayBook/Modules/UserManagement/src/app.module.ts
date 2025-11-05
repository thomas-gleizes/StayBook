import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './shared/modules/user.module';
import { MessagingModule } from './shared/messaging/messaging.module';
import { getEnvironment } from './shared/config/environment';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => getEnvironment(config) }),
    PrismaModule,
    MessagingModule,
    UserModule,
  ],
})
export class AppModule {}
