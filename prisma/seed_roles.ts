import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

async function main() {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  console.log('Generated bcrypt hash for "password123":', hashedPassword);

  // 1. Ensure Customer exists and has password123
  const customer = await prisma.user.upsert({
    where: { email: 'customer@switchlab.local' },
    update: { password: hashedPassword, role: Role.CUSTOMER },
    create: {
      name: 'Adit Pratama',
      email: 'customer@switchlab.local',
      password: hashedPassword,
      role: Role.CUSTOMER,
      isVerified: true,
      locationCity: 'Jakarta',
      avgRating: 0,
    },
  });
  console.log('✓ CUSTOMER account ready:', customer.email);

  // 2. Ensure Modder exists and has password123
  const modder = await prisma.user.upsert({
    where: { email: 'raka@switchlab.local' },
    update: { password: hashedPassword, role: Role.MODDER },
    create: {
      name: 'Raka Modder',
      email: 'raka@switchlab.local',
      password: hashedPassword,
      role: Role.MODDER,
      isVerified: true,
      locationCity: 'Bandung',
      avgRating: 4.9,
    },
  });
  console.log('✓ MODDER account ready:', modder.email);

  // 3. Ensure Second Modder (Nadia) has password123
  const modder2 = await prisma.user.upsert({
    where: { email: 'nadia@switchlab.local' },
    update: { password: hashedPassword, role: Role.MODDER },
    create: {
      name: 'Nadia Tuner',
      email: 'nadia@switchlab.local',
      password: hashedPassword,
      role: Role.MODDER,
      isVerified: true,
      locationCity: 'Depok',
      avgRating: 4.8,
    },
  });
  console.log('✓ SECOND MODDER account ready:', modder2.email);

  // 4. Ensure ADMIN exists and has password123
  const admin = await prisma.user.upsert({
    where: { email: 'admin@switchlab.local' },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      name: 'SwitchLab Vault Admin',
      email: 'admin@switchlab.local',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      locationCity: 'Jakarta',
      avgRating: 5.0,
    },
  });
  console.log('✓ ADMIN account ready:', admin.email);

  // 5. Also update any existing user if they want to log in with arzaqajradika1@gmail.com
  try {
    const arzaq = await prisma.user.findFirst({
      where: { email: { equals: 'arzaqajradika1@GMAIL.COM', mode: 'insensitive' } },
    });
    if (arzaq) {
      await prisma.user.update({
        where: { id: arzaq.id },
        data: { password: hashedPassword },
      });
      console.log('✓ Updated arzaqajradika1@gmail.com password to "password123"');
    }
  } catch (err) {
    // ignore
  }

  console.log('\n--- ALL ROLE CREDENTIALS CONFIGURED SUCCESSFULLY ---');
  console.log('Password for ALL accounts: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
