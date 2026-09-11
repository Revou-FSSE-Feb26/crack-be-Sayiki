import { Test, TestingModule } from '@nestjs/testing';
import { ModdersService } from './modders.service';
import { PrismaService } from '../prisma.service';

describe('ModdersService', () => {
  let service: ModdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModdersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ModdersService>(ModdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
