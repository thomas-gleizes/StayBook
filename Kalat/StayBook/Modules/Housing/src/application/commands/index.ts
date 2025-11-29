import { CreateHousingHandler } from './create-housing/create-housing.handler';
import { CommandHandlerType } from '@nestjs/cqrs';

export const housingCommands: CommandHandlerType[] = [CreateHousingHandler];
