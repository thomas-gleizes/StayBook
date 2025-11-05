import { UserAggregate } from '../aggregates/user.aggregate';
import { CommandRepositoryPort } from './base-command-repository.port';

export const USER_COMMAND_REPOSITORY = Symbol('USER_COMMAND_REPOSITORY');

export interface IUserCommandRepository extends CommandRepositoryPort<UserAggregate> {}
