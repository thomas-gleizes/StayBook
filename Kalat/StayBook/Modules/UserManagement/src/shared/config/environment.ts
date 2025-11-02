import { z } from 'zod';
import { LogLevel } from '@nestjs/common';

export const environment = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  LOG_LEVEL: z.string().transform((value) => value.split(',') as LogLevel[]),
  KAFKA_BROKERS: z.string().transform((value) => value.split(',')),
});

export function getEnvironment<Values = unknown>(values: Values) {
  return environment.parse(values, {});
}
