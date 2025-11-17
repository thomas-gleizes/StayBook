import { Global, Module } from '@nestjs/common';
import { LockerService } from './locker.service';

@Global()
@Module({ providers: [LockerService], exports: [LockerService] })
export class LockerModule {}
