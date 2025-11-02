import { Module } from '@nestjs/common';
import { UserManagementModule } from './user-management/user-management.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './shared/kafka/kafka.module';
import { getEnvironment } from './shared/config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => getEnvironment(config),
    }),
    KafkaModule,
    UserManagementModule,
  ],
})
export class AppModule {}
