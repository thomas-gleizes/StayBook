export const USER_QUERY_REPOSITORY = Symbol('USER_QUERY_REPOSITORY');

export type UserView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export interface UserQueryRepositoryPort {
  findById(id: string): Promise<null | UserView>;
}
