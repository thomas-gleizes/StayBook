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

const argsSchema = z.object({
  total: z.number().positive().default(50),
});

async function createUserSeeding(args: z.infer<typeof argsSchema>) {
  const app = await NestFactory.createApplicationContext(UserSeedingModule);
  const logger = new Logger('User Seed');
  const userCommandRepository = app.get(UserCommandRepository);

  logger.log(`start user seeding ${args.total}`);
  for (let i = 0; i < args.total; i++) {
    const random = Math.random();

    const aggregate = UserAggregate.create(new UserId(randomUUID()), {
      firstName: faker.person.firstName(random > 0.5 ? 'female' : 'male'),
      lastName: faker.person.lastName(random > 0.5 ? 'female' : 'male'),
      email: faker.internet.email(),
    });

    const snapshot = aggregate.takeSnapshot();

    logger.log(
      `${i} : ${snapshot.id} - ${snapshot.firstName} ${snapshot.lastName} - ${snapshot.email.toLowerCase()}`,
    );

    await userCommandRepository.persist(aggregate);
  }
  logger.log(`Done`);
}

createUserSeeding(parseArgs(argsSchema)).finally(() => process.exit(0));
