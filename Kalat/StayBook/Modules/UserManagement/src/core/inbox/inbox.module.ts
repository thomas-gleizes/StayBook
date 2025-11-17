import { Global, Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxProcessor } from './inbox.processor';
import { ProjectionModule } from '../projections/projection.module';

@Global()
@Module({
  imports: [ProjectionModule],
  providers: [InboxService, InboxProcessor],
  exports: [InboxService],
})
export class InboxModule {}
