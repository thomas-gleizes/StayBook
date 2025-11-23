import { SERVICE_FQN } from '../config/constants';

export const KAFKA_TOPICS = {
  User: `${SERVICE_FQN}.domain.User`,
  CreateUserCommand: `${SERVICE_FQN}.command.CreateUserCommand`,
  EditUserCommand: `${SERVICE_FQN}.command.EditUserCommand`,
  FindUserQuery: `${SERVICE_FQN}.query.FindUserQuery`,
} as const;
