import { z } from 'zod/v4';
import { parseArgs } from '../../../utils/parse-args';
import { NestFactory } from '@nestjs/core';
import { UserAggregate } from '../../../domain/aggregates/user.aggregate';
import { UserId } from '../../../domain/values-object/user-id';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker/locale/fr';
import { UserCommandRepository } from '../../repositories/user-command.repository';
import { Logger } from '@nestjs/common';
import { UserSeedingModule } from './user-seeding.module';
import { ag } from '@faker-js/faker/dist/airline-DF6RqYmq';

const argsSchema = z.object({
  total: z.number().positive().default(50),
});

async function createUserSeeding(args: z.infer<typeof argsSchema>) {
  const app = await NestFactory.createApplicationContext(UserSeedingModule);
  const logger = new Logger('User Seed');
  const userCommandRepository = app.get(UserCommandRepository);

  logger.log(`start user seeding ${args.total}`);
  for (let i = 0; i < args.total; i++) {
    const aggregate = UserAggregate.create(new UserId(randomUUID()), {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    });

    aggregate.edit({ firstName: 'Edit-' + aggregate.getFirstName(), lastName: faker.person.lastName() });

    console.log(`CREATED ${aggregate.getId()} - ${aggregate.getEmail()}`);

    logger.log(
      `${i} : ${aggregate.getAggregateId()} - ${aggregate.getFirstName()} ${aggregate.getLastName()} - ${aggregate
        .getEmail()
        .toLowerCase()}`,
    );

    await userCommandRepository.persist(aggregate);

    const re = await userCommandRepository.findById(aggregate.getAggregateId());

    console.log(`REBUILD ${re!.getId()} - ${re!.getEmail()}`);
  }
  logger.log(`Done`);
}

createUserSeeding(parseArgs(argsSchema))
  .catch(console.error)
  .finally(() => process.exit(0));
