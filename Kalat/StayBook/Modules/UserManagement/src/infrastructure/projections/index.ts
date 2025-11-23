import { Type } from '@nestjs/common';
import { IProjectionHandler } from '../../core/projections/projection.decorator';
import { UserCreatedProjection } from './user-created.projection';
import { UserEditedProjection } from './user-edited.projection';

export const userProjections: Type<IProjectionHandler>[] = [UserCreatedProjection, UserEditedProjection];
