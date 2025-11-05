import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';

export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      transactionOptions: { timeout: 10_000 },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
