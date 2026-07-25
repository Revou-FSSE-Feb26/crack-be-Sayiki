import 'dotenv/config';
import {
  BookingDeliveryMethod,
  BookingStatus,
  PrismaClient,
  Role,
  ServiceCategory,
  ServiceOptionType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

async function main() {
  await prisma.review.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceOption.deleteMany();
  await prisma.service.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.user.deleteMany();

  const customer = await prisma.user.create({
    data: {
      name: 'Adit Pratama',
      email: 'customer@switchlab.local',
      password: 'hashed-password-customer',
      role: Role.CUSTOMER,
      isVerified: true,
      locationCity: 'Jakarta',
      avgRating: 0,
    },
  });

  const modderOne = await prisma.user.create({
    data: {
      name: 'Raka Modder',
      email: 'raka@switchlab.local',
      password: 'hashed-password-modder-1',
      role: Role.MODDER,
      isVerified: true,
      locationCity: 'Bandung',
      avgRating: 4.9,
    },
  });

  const modderTwo = await prisma.user.create({
    data: {
      name: 'Nadia Tuner',
      email: 'nadia@switchlab.local',
      password: 'hashed-password-modder-2',
      role: Role.MODDER,
      isVerified: true,
      locationCity: 'Depok',
      avgRating: 4.8,
    },
  });

  await prisma.portfolio.createMany({
    data: [
      {
        modderId: modderOne.id,
        imageKey: 'portfolio/raka-01.jpg',
        title: 'Silent Tactile Build',
        description:
          'Lubing, filming, and foam tuning for a quiet daily driver.',
      },
      {
        modderId: modderOne.id,
        imageKey: 'portfolio/raka-02.jpg',
        title: 'Thock Focused 75%',
        description: 'Custom acoustic stack with balanced stab tuning.',
      },
      {
        modderId: modderTwo.id,
        imageKey: 'portfolio/nadia-01.jpg',
        title: 'Creamy Linear Desk Setup',
        description: 'Linear switch refresh with smoother bottom out.',
      },
    ],
  });

  const serviceOne = await prisma.service.create({
    data: {
      modderId: modderOne.id,
      title: 'Premium Switch Lubing',
      description: 'Full lubing service for smooth keypress feel.',
      basePrice: 3500,
      category: ServiceCategory.SWITCH_MODS,
      options: {
        create: [
          {
            optionName: 'Krytox 205g0',
            optionType: ServiceOptionType.LUBE_TYPE,
            extraPrice: 0,
          },
          {
            optionName: 'Deskeys Film',
            optionType: ServiceOptionType.ADDON_SERVICE,
            extraPrice: 1000,
          },
        ],
      },
    },
    include: { options: true },
  });

  const serviceTwo = await prisma.service.create({
    data: {
      modderId: modderOne.id,
      title: 'Stabilizer Tuning',
      description: 'Rattle reduction and balance tuning for stabilizers.',
      basePrice: 25000,
      category: ServiceCategory.STABILIZER_MODS,
      options: {
        create: [
          {
            optionName: 'Holee Mod',
            optionType: ServiceOptionType.ADDON_SERVICE,
            extraPrice: 5000,
          },
          {
            optionName: 'XHT-BDZ',
            optionType: ServiceOptionType.LUBE_TYPE,
            extraPrice: 3000,
          },
        ],
      },
    },
    include: { options: true },
  });

  const serviceThree = await prisma.service.create({
    data: {
      modderId: modderTwo.id,
      title: 'Keyboard Sound Tuning',
      description: 'Acoustic tuning for case, plate, and foam stack.',
      basePrice: 45000,
      category: ServiceCategory.CASE_AND_ACOUSTIC,
      options: {
        create: [
          {
            optionName: 'Poron Foam',
            optionType: ServiceOptionType.FOAM_TYPE,
            extraPrice: 10000,
          },
          {
            optionName: 'PE Foam',
            optionType: ServiceOptionType.FOAM_TYPE,
            extraPrice: 8000,
          },
        ],
      },
    },
    include: { options: true },
  });

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      modderId: modderOne.id,
      keyboardModel: 'Keychron K8 Pro',
      deliveryMethod: BookingDeliveryMethod.COURIER,
      totalPrice: 93000,
      bookingDate: new Date('2026-07-30T10:00:00.000Z'),
      status: BookingStatus.PAID_WAITING_MODDER,
      proposedDate: new Date('2026-07-31T10:00:00.000Z'),
      paymentProof: 'proofs/payment-001.png',
      inboundTrackingNum: 'JNE1234567890',
      items: {
        create: [
          {
            serviceId: serviceOne.id,
            selectedOptions: {
              lube: 'Krytox 205g0',
              addon: 'Deskeys Film',
            },
            subTotal: 45000,
          },
          {
            serviceId: serviceTwo.id,
            selectedOptions: {
              mod: 'Holee Mod',
              lube: 'XHT-BDZ',
            },
            subTotal: 48000,
          },
        ],
      },
    },
    include: { items: true },
  });

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: customer.id,
      modderId: modderOne.id,
      rating: 5,
      comment:
        'Hasilnya rapi, rattle hilang, dan feel keypress jauh lebih enak.',
    },
  });

  await prisma.booking.create({
    data: {
      customerId: customer.id,
      modderId: modderTwo.id,
      keyboardModel: 'MonsGeek M1',
      deliveryMethod: BookingDeliveryMethod.WALK_IN,
      totalPrice: 65000,
      bookingDate: new Date('2026-08-02T13:00:00.000Z'),
      status: BookingStatus.UNPAID,
      items: {
        create: [
          {
            serviceId: serviceThree.id,
            selectedOptions: {
              foam: 'Poron Foam',
            },
            subTotal: 65000,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
