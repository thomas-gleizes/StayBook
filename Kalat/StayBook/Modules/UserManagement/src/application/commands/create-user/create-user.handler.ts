import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserAggregate } from '../../../domain/aggregates/user.aggregate';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '../../../domain/repostiories/user-command.repostiory';
import {
  IDENTIFIANT_GENERATOR,
  IdentifiantGeneratorPort,
} from '../../../domain/ports/identifiant-generator.port';
import { UserId } from '../../../domain/values-object/user-id';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepository: IUserCommandRepository,
    @Inject(IDENTIFIANT_GENERATOR)
    private readonly identifiantGenerator: IdentifiantGeneratorPort,
  ) {}

  async execute(command: CreateUserCommand) {
    const aggregate = UserAggregate.create(new UserId(this.identifiantGenerator.generate()), command.input);

    await this.userCommandRepository.persist(aggregate);

    return aggregate;
  }
}
