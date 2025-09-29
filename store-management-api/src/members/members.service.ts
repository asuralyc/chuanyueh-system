import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';
import { Member } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    // 生成會員編號 - 查找最大的會員編號並 +1
    const lastMember = await this.prisma.member.findFirst({
      orderBy: { memberNumber: 'desc' },
      select: { memberNumber: true },
    });

    let nextNumber = 1;
    if (lastMember?.memberNumber) {
      // 提取數字部分 (M000001 -> 000001 -> 1)
      const currentNumber = parseInt(lastMember.memberNumber.substring(1));
      nextNumber = currentNumber + 1;
    }

    const memberNumber = `M${nextNumber.toString().padStart(6, '0')}`;

    const member = await this.prisma.member.create({
      data: {
        ...createMemberDto,
        memberNumber,
        birthDate: createMemberDto.birthDate
          ? new Date(createMemberDto.birthDate)
          : null,
      },
      include: {
        homeBranch: true,
      },
    });

    return member;
  }

  async findAll(query: QueryMemberDto) {
    const { search, branchId } = query;

    // 確保 page 和 limit 是數字
    const page = query.page ? parseInt(String(query.page)) || 1 : 1;
    const limit = query.limit ? parseInt(String(query.limit)) || 10 : 10;

    const where: any = {};

    // 搜尋條件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { memberNumber: { contains: search } },
      ];
    }

    // 分店篩選
    if (branchId) {
      where.homeBranchId = branchId;
    }

    // 計算總數和分頁
    const total = await this.prisma.member.count({ where });
    const members = await this.prisma.member.findMany({
      where,
      include: {
        homeBranch: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        homeBranch: true,
        serviceRecords: {
          include: {
            branch: true,
            employee: true,
          },
          orderBy: { serviceDate: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`會員 ID ${id} 不存在`);
    }

    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException(`會員 ID ${id} 不存在`);
    }

    const updatedMember = await this.prisma.member.update({
      where: { id },
      data: {
        ...updateMemberDto,
        birthDate: updateMemberDto.birthDate
          ? new Date(updateMemberDto.birthDate)
          : undefined,
      },
      include: {
        homeBranch: true,
      },
    });

    return updatedMember;
  }

  async remove(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException(`會員 ID ${id} 不存在`);
    }

    await this.prisma.member.delete({ where: { id } });
    return { message: `會員 ${member.name} 已刪除` };
  }

  async findServiceRecords(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException(`會員 ID ${id} 不存在`);
    }

    const serviceRecords = await this.prisma.serviceRecord.findMany({
      where: { memberId: id },
      include: {
        branch: true,
        employee: {
          select: {
            name: true,
            employeeNumber: true,
          },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    return serviceRecords;
  }
}
