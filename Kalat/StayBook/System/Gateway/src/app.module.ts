import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './shared/kafka/kafka.module';
import { getEnvironment } from './shared/config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => getEnvironment(config),
    }),
    KafkaModule,
    UserModule,
  ],
})
export class AppModule {}
