import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserQuery } from './find-user.query';
import {
  USER_QUERY_REPOSITORY,
  UserQueryRepositoryPort,
  UserView,
} from '../../../domain/repostiories/user-query.repository';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/users/user-not-found.exception';

@QueryHandler(FindUserQuery)
export class FindUserHandler implements IQueryHandler<FindUserQuery> {
  constructor(
    @Inject(USER_QUERY_REPOSITORY)
    private readonly queryRepository: UserQueryRepositoryPort,
  ) {}

  async execute(query: FindUserQuery): Promise<UserView> {
    console.log('QUERY', query);

    const user = await this.queryRepository.findById(query.userId);

    if (!user) throw new UserNotFoundException();

    return user;
  }
}
