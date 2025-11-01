import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environment } from './shared/config/environment';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validationSchema: environment })],
  controllers: [],
})
export class AppModule {}
