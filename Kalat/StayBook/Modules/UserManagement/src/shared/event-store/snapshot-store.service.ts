import { PrismaService } from '../prisma/prisma.service';

export class SnapshotStoreService {
  constructor(private readonly prisma: PrismaService) {}

  // async makeSnapshot<TAggregate extends BaseAggregateRoot>(aggregate: TAggregate) {
  //   const lastSnapshot = await this.findLastestSnapshot(aggregate.getAggregateId());
  // }
  //
  // async findLastestSnapshot(aggregateId: string) {
  //   const snapshot = await this.prisma.eventSnapshot.findFirst({
  //     where: { aggregateId: aggregateId },
  //     orderBy: { version: 'desc' },
  //   });
  //
  //   if (!snapshot) return null;
  //
  //   return snapshot;
  // }
}
