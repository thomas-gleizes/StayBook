import { Global, Module } from '@nestjs/common';
import { RegistererService } from './registerer.service';
import { DiscoveryModule } from '@nestjs/core';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [RegistererService],
  exports: [RegistererService],
})
export class RegistererModule {}
