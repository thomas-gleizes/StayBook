import { z } from 'zod';
import { LogLevel } from '@nestjs/common';
import 'dotenv/config';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  LOG_LEVEL: z.string().transform((value) => value.split(',') as LogLevel[]),
  KAFKA_BROKERS: z.string().transform((value) => value.split(',')),
  DATABASE_URL: z.url(),
  SCHEMA_REGISTER_URL: z.url(),
});

export function validateEnvironment<Values = unknown>(values: Values | null = null) {
  if (values) return environmentSchema.parse(values, {});

  return environmentSchema.parse(process.env);
}

export const environment = validateEnvironment();
