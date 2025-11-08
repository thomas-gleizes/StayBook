import * as yargs from 'yargs';
import { z } from 'zod/v4';

export function parseArgs<TSchema extends z.ZodTypeAny>(schema: TSchema): z.infer<TSchema> {
  const raw: unknown = yargs(process.argv.slice(2)).parse();
  return schema.parse(raw);
}
