import { z } from 'zod';
import { LogLevel } from '@nestjs/common';
import 'dotenv/config';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  LOG_LEVEL: z.string().transform((value) => value.split(',') as LogLevel[]),
  KAFKA_BROKERS: z.string().transform((value) => value.split(',')),
  DATABASE_URL: z.url(),

  SNAPSHOT: z.coerce.number().min(50).optional().default(100),

  OUTBOX: z
    .string()
    .optional()
    .default('enable')
    .transform((value) => value === 'enable'),
  OUTBOX_INTERVAL_MS: z.coerce.number().positive().optional().default(3000),
  OUTBOX_BATCH_SIZE: z.coerce.number().positive().optional(),
  OUTBOX_MAX_RETRY: z.coerce.number().positive().optional(),
  OUTBOX_KEEP_PROCESSED_COUNT: z.coerce.number().positive().optional(),

  PROFILER: z
    .string()
    .optional()
    .default('disable')
    .transform<boolean>((value) => value === 'enable'),
  PROFILER_DETAILS: z
    .string()
    .optional()
    .default('disable')
    .transform<boolean>((value) => value === 'enable'),
});

export function validateEnvironment<Values = unknown>(values: Values | null = null) {
  if (values) return environmentSchema.parse(values, {});

  return environmentSchema.parse(process.env);
}

export const environment = validateEnvironment();
