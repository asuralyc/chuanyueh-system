import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { ResignEmployeeDto } from './dto/resign-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // 檢查 email 是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('此 Email 已被使用');
    }

    // 生成員工編號 - 簡化版本
    const employeeCount = await this.prisma.employee.count();
    const employeeNumber = `E${(employeeCount + 1).toString().padStart(6, '0')}`;

    // 加密密碼
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(
      createEmployeeDto.password,
      saltRounds,
    );

    // 使用交易確保資料一致性
    const result = await this.prisma.$transaction(async (prisma) => {
      // 建立用戶帳號
      const user = await prisma.user.create({
        data: {
          email: createEmployeeDto.email,
          passwordHash,
        },
      });

      // 建立員工資料
      const employee = await prisma.employee.create({
        data: {
          userId: user.id,
          employeeNumber,
          name: createEmployeeDto.name,
          branchId: createEmployeeDto.branchId,
          title: createEmployeeDto.title,
          phone: createEmployeeDto.phone,
          hireDate: createEmployeeDto.hireDate
            ? new Date(createEmployeeDto.hireDate)
            : null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              createdAt: true,
            },
          },
          branch: true,
        },
      });

      return employee;
    });

    return result;
  }

  async findAll(query: QueryEmployeeDto) {
    const { search, branchId, status } = query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const where: any = {};

    // 搜尋條件
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { employeeNumber: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    // 分店篩選
    if (branchId) {
      where.branchId = branchId;
    }

    // 狀態篩選
    if (status) {
      where.status = status;
    }

    const total = await this.prisma.employee.count({ where });
    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLoginAt: true,
          },
        },
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        branch: true,
        serviceRecords: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                memberNumber: true,
              },
            },
            branch: true,
          },
          orderBy: { serviceDate: 'desc' },
          take: 10, // 只顯示最近 10 筆服務記錄
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`員工 ID ${id} 不存在`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`員工 ID ${id} 不存在`);
    }

    // 如果要更新 email，檢查是否衝突
    if (
      updateEmployeeDto.email &&
      updateEmployeeDto.email !== employee.user.email
    ) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateEmployeeDto.email },
      });

      if (existingUser && existingUser.id !== employee.userId) {
        throw new ConflictException('此 Email 已被使用');
      }
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      // 更新用戶資料
      const userUpdateData: any = {};
      if (updateEmployeeDto.email) {
        userUpdateData.email = updateEmployeeDto.email;
      }
      if (updateEmployeeDto.password) {
        const saltRounds = 10;
        userUpdateData.passwordHash = await bcrypt.hash(
          updateEmployeeDto.password,
          saltRounds,
        );
      }

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: employee.userId },
          data: userUpdateData,
        });
      }

      // 更新員工資料
      const employeeUpdateData: any = {};
      if (updateEmployeeDto.name)
        employeeUpdateData.name = updateEmployeeDto.name;
      if (updateEmployeeDto.branchId)
        employeeUpdateData.branchId = updateEmployeeDto.branchId;
      if (updateEmployeeDto.title !== undefined)
        employeeUpdateData.title = updateEmployeeDto.title;
      if (updateEmployeeDto.phone !== undefined)
        employeeUpdateData.phone = updateEmployeeDto.phone;
      if (updateEmployeeDto.hireDate !== undefined) {
        employeeUpdateData.hireDate = updateEmployeeDto.hireDate
          ? new Date(updateEmployeeDto.hireDate)
          : null;
      }
      if (updateEmployeeDto.status)
        employeeUpdateData.status = updateEmployeeDto.status;

      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: employeeUpdateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              lastLoginAt: true,
            },
          },
          branch: true,
        },
      });

      return updatedEmployee;
    });

    return result;
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`員工 ID ${id} 不存在`);
    }

    // 軟刪除：將狀態改為 resigned（舊的方法，不記錄原因）
    await this.prisma.employee.update({
      where: { id },
      data: {
        status: 'resigned',
        resignationDate: new Date(),
        resignationReason: '未提供離職原因'
      },
    });

    return { message: `員工 ${employee.name} 已設為離職狀態` };
  }

  async resign(id: string, resignEmployeeDto: ResignEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`員工 ID ${id} 不存在`);
    }

    if (employee.status === 'resigned') {
      throw new ConflictException(`員工 ${employee.name} 已經處於離職狀態`);
    }

    // 設定離職狀態，並記錄離職原因和日期
    const resignationDate = resignEmployeeDto.resignationDate
      ? new Date(resignEmployeeDto.resignationDate)
      : new Date();

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        status: 'resigned',
        resignationDate,
        resignationReason: resignEmployeeDto.resignationReason
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLoginAt: true,
          },
        },
        branch: true,
      },
    });

    return {
      message: `員工 ${employee.name} 已設為離職狀態`,
      data: updatedEmployee
    };
  }

  async findServiceRecords(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`員工 ID ${id} 不存在`);
    }

    const serviceRecords = await this.prisma.serviceRecord.findMany({
      where: { employeeId: id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            memberNumber: true,
          },
        },
        branch: true,
      },
      orderBy: { serviceDate: 'desc' },
    });

    return serviceRecords;
  }
}
