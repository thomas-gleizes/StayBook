import { Global, Module } from '@nestjs/common';
import { ProjectionService } from './projection.service';
import { RegistererModule } from '../registerer/registerer.module';

@Global()
@Module({
  imports: [RegistererModule],
  providers: [ProjectionService],
  exports: [ProjectionService],
})
export class ProjectionModule {}
