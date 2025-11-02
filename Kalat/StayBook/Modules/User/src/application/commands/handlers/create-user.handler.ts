import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../create-user.command';
import { UserAggregate } from '../../../domain/aggregates/user-aggregate';
import { UserCommandRepository } from '../../../infrascture/repositories/user-command.repository';
import { Inject } from '@nestjs/common';
import { USER_COMMAND_REPOSITORY } from '../../../domain/repostiories/user-command.repostiory';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    public readonly userCommandRepository: UserCommandRepository,
  ) {}

  async execute(command: CreateUserCommand) {
    const aggregate = UserAggregate.create(command.data);

    this.userCommandRepository.persist(aggregate);

    return aggregate;
  }
}
