import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum Lockable {
  OUTBOX = 1,
}

@Injectable()
export class LockerService {
  private readonly logger = new Logger('Locker');

  constructor(private readonly prisma: PrismaService) {}

  async lock(ressource: Lockable): Promise<boolean> {
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
}
