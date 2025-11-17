import { UserCreatedProjection } from './user-created.projection';
import { Type } from '@nestjs/common';
import { IProjectionHandler } from '../../core/projections/projection.decorator';

export const userProjections: Type<IProjectionHandler<any>>[] = [UserCreatedProjection];
