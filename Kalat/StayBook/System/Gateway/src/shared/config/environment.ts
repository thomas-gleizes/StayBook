import { z } from 'zod';
import { LogLevel } from '@nestjs/common';

export const environment = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'provision'])
    .default('development'),
  LOG_LEVEL: z
    .string()
    .default('log')
    .transform<LogLevel[]>((value) => value.split(',') as LogLevel[]),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  KAFKA_BROKERS: z.string().transform<string[]>((value) => value.split(',')),
  KAFKA_CONSUMER_GROUP: z.string(),
});

export function getEnvironment<Values = unknown>(values: Values) {
  return environment.parse(values, {});
}
