import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvironment } from './shared/config/environment';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: (config) => getEnvironment(config) })],
  controllers: [],
})
export class AppModule {}
