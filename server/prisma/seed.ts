// server/prisma/seed.ts
//
// Seeds ONE supervisor account and ONE test inspector account.
// Run: npx ts-node prisma/seed.ts
//
// Credentials (change before production!):
//   Supervisor : matricule=SUP-001  password=supervisor123
//   Inspector  : matricule=INS-001  password=inspector123

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 12;

  // Supervisor
  await prisma.inspector.upsert({
    where:  { matricule: 'SUP-001' },
    update: {},
    create: {
      matricule:    'SUP-001',
      name:         'المشرف الرئيسي',
      passwordHash: await bcrypt.hash('supervisor123', SALT_ROUNDS),
      officeName:   'مديرية البيئة',
      role:         'SUPERVISOR',
    },
  });

  // Inspector
  await prisma.inspector.upsert({
    where:  { matricule: 'INS-001' },
    update: {},
    create: {
      matricule:    'INS-001',
      name:         'المفتش التجريبي',
      passwordHash: await bcrypt.hash('inspector123', SALT_ROUNDS),
      officeName:   'مكتب التفتيش',
      role:         'INSPECTOR',
    },
  });

  console.log('✅ Seed complete — SUP-001 / supervisor123 and INS-001 / inspector123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
