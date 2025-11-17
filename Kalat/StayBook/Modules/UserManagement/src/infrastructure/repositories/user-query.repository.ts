import { UserQueryRepositoryPort, UserView } from '../../domain/repostiories/user-query.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { User } from '../../../generated/prisma/client';

export class UserQueryRepository implements UserQueryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  mapToDomain(record: User): UserView {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
    };
  }

  async findById(id: string): Promise<UserView | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });

    if (!record) return null;

    return this.mapToDomain(record);
  }
}
