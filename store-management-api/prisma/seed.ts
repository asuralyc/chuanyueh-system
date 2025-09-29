import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create a branch
  const branch = await prisma.branch.upsert({
    where: { code: 'TP-XINYI' },
    update: {},
    create: {
      name: '台北信義店',
      code: 'TP-XINYI',
      address: '台北市信義區信義路五段7號',
    },
  });

  // 2. Create roles
  const managerRole = await prisma.role.upsert({
    where: { code: 'BRANCH_MANAGER' },
    update: {},
    create: {
      code: 'BRANCH_MANAGER',
      name: '分店經理',
      description: '管理單一分店的所有事務',
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { code: 'EMPLOYEE' },
    update: {},
    create: {
      code: 'EMPLOYEE',
      name: '一般員工',
      description: '基本操作權限',
    },
  });

  // 3. Create a user for the manager
  const hashedPassword = await bcrypt.hash('password123', 10);
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      passwordHash: hashedPassword,
    },
  });

  // 4. Create an employee record for the manager
  await prisma.employee.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      branchId: branch.id,
      employeeNumber: 'EMP001',
      name: '王經理',
      title: '店經理',
    },
  });

  // 5. Assign the manager role to the user for that specific branch
  await prisma.userRole.upsert({
    where: {
      unique_user_role_branch: {
        userId: managerUser.id,
        roleId: managerRole.id,
        branchId: branch.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
      branchId: branch.id,
    },
  });

  // 6. Create additional branches
  const branch2 = await prisma.branch.upsert({
    where: { code: 'HC-GUANGFU' },
    update: {},
    create: {
      name: '新竹光復店',
      code: 'HC-GUANGFU',
      address: '新竹市光復路一段100號',
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { code: 'TC-ZHONGGANG' },
    update: {},
    create: {
      name: '台中中港店',
      code: 'TC-ZHONGGANG',
      address: '台中市西屯區中港路二段200號',
    },
  });

  // 7. Create test members
  const members = [
    {
      name: '王小明',
      phone: '0912345678',
      email: 'wang@example.com',
      homeBranchId: branch.id,
      gender: 'male' as const,
      birthDate: new Date('1985-05-15'),
    },
    {
      name: '李小華',
      phone: '0923456789',
      email: 'lee@example.com',
      homeBranchId: branch.id,
      gender: 'female' as const,
      birthDate: new Date('1990-08-20'),
    },
    {
      name: '張大偉',
      phone: '0934567890',
      email: 'chang@example.com',
      homeBranchId: branch2.id,
      gender: 'male' as const,
      birthDate: new Date('1988-03-10'),
    },
    {
      name: '陳美麗',
      phone: '0945678901',
      email: 'chen@example.com',
      homeBranchId: branch3.id,
      gender: 'female' as const,
      birthDate: new Date('1992-12-05'),
    },
    {
      name: '林志明',
      phone: '0956789012',
      email: 'lin@example.com',
      homeBranchId: branch.id,
      gender: 'male' as const,
    },
  ];

  for (const [index, memberData] of members.entries()) {
    const memberNumber = `M${(index + 1).toString().padStart(6, '0')}`;
    
    await prisma.member.upsert({
      where: { memberNumber },
      update: {},
      create: {
        ...memberData,
        memberNumber,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
