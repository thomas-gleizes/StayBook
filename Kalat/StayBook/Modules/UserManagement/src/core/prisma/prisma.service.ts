import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {
    super({ transactionOptions: { timeout: 10_000 } });
    const profile = this.config.getOrThrow<boolean>('PROFILER');
    const profileDetails = this.config.getOrThrow<boolean>('PROFILER_DETAILS');

    if (profile) {
      Object.assign(
        this,
        this.$extends({
          name: 'profiler',
          query: {
            $allModels: {
              async $allOperations({ model, operation, args, query }) {
                const logger = new Logger('Prisma');

                const start = Date.now();
                try {
                  const result: unknown = await query(args);
                  const duration = Date.now() - start;

                  if (profileDetails) logger.log(`⏱ [${model}.${operation}] success ${duration}ms`, args);
                  else logger.log(`⏱ [${model}.${operation}] success ${duration}ms`);

                  return result;
                } catch (error) {
                  const duration = Date.now() - start;
                  logger.warn(
                    `⏱ [${model}.${operation}] failed ${duration}ms - ${(error as Error).message}`,
                  );
                  throw error;
                }
              },
            },
          },
        }),
      );
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
