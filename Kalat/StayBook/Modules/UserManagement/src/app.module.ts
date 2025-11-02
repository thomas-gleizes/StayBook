import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvironment } from './shared/config/environment';
import { UserModule } from './shared/modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => getEnvironment(config) }),
    UserModule,
  ],
})
export class AppModule {}
