import { randomUUID } from 'node:crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateHousing } from './create-housing.command';
import { HousingAggregate } from '../../../domain/aggregate/housing.aggregate';
import { HousingId } from '../../../domain/value-object/housing-id';

@CommandHandler(CreateHousing)
export class CreateHousingHandler implements ICommandHandler<CreateHousing> {
  async execute(command: CreateHousing): Promise<string> {
    console.log('Handle CreateHousing', command);

    const housingId = new HousingId(randomUUID());
    const aggregate = HousingAggregate.create(housingId);

    return aggregate.getAggregateId();
  }
}
