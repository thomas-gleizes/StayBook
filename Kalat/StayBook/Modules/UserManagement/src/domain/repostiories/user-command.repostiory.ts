import { UserAggregate } from '../aggregates/user-aggregate';
import { BaseCommandRepository } from '../../shared/interface/base-command.repository';

export const USER_COMMAND_REPOSITORY = Symbol('USER_COMMAND_REPOSITORY');

export interface IUserCommandRepository extends BaseCommandRepository<UserAggregate> {}
