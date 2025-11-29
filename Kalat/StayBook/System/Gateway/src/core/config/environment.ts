import { z } from 'zod';
import { LogLevel } from '@nestjs/common';

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'provision'])
    .default('development'),
  LOG_LEVEL: z
    .string()
    .default('log')
    .transform<LogLevel[]>((value) => value.split(',') as LogLevel[]),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  KAFKA_BROKERS: z.string().transform((value) => value.split(',')),
  SCHEMA_REGISTER_URL: z.url(),
});

export function validateEnvironment<Values = unknown>(
  values: Values | null = null,
) {
  if (values) return environmentSchema.parse(values, {});

  return environmentSchema.parse(process.env);
}

export const environment = validateEnvironment();
