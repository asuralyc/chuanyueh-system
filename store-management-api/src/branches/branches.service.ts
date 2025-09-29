import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const branches = await this.prisma.branch.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return branches;
  }
}
