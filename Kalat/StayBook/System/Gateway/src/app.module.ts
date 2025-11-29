import { Module } from '@nestjs/common';
import { UserManagementModule } from './user-management/user-management.module';
import { HousingModule } from './housing/housing.module';

@Module({ imports: [UserManagementModule, HousingModule] })
export class AppModule {}
