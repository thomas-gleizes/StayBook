import { z } from 'zod';

export const environment = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  LOG_LEVEL: z.string().default('log'),
  KAFKA_BROKERS: z.string(),
  KAFKA_CONSUMER: z.string(),
});

export function getEnvironment<Values = unknown>(values: Values) {
  return environment.parse(values, {});
}
