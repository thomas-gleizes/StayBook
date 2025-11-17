import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum Lockable {
  OUTBOX_PROCESS = 1,
  OUTBOX_CLEAR = 2,
  INBOX_PROCESS = 3,
  INBOX_CLEAR = 4,
}

@Injectable()
export class LockerService {
  private readonly logger = new Logger('Locker');

  constructor(private readonly prisma: PrismaService) {}

  async acquire(ressource: Lockable): Promise<boolean> {
    const result: { locked: boolean }[] = await this.prisma.$queryRaw`
      SELECT pg_try_advisory_lock(${ressource}) AS locked
    `;

    if (result[0]?.locked === true) {
      this.logger.verbose(`Lock created : ${ressource}`);
    } else {
      this.logger.verbose(`Lock already set : ${ressource}`);
    }

    return result[0]?.locked === true;
  }

  async release(ressource: Lockable): Promise<void> {
    await this.prisma.$queryRaw`
      SELECT pg_advisory_unlock(${ressource})
    `;

    this.logger.verbose(`Lock release : ${ressource}`);
  }

  async run(ressource: Lockable, callback: () => Promise<void> | void): Promise<boolean> {
    const isAcquire = await this.acquire(ressource);

    if (!isAcquire) return false;

    try {
      await callback();
    } finally {
      await this.release(ressource);
    }

    return true;
  }
}
