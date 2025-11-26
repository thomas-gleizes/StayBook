import { Global, Module } from '@nestjs/common';
import { MessagingModule } from './infrastructure/messaging/messaging.module';

@Global()
@Module({
  imports: [MessagingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
