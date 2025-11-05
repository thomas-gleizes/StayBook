import { z } from "zod";

export const environment = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "provision"])
    .default("development"),
  KAFKA_BROKERS: z.string().transform((value) => value.split(",")),
  DATABASE_URL: z.url(),
});

export function getEnvironment<Values = unknown>(values: Values) {
  return environment.parse(values, {});
}
