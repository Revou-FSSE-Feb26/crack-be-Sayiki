import { Test, TestingModule } from '@nestjs/testing';
import { ModdersController } from './modders.controller';
import { ModdersService } from './modders.service';

describe('ModdersController', () => {
  let controller: ModdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModdersController],
      providers: [
        {
          provide: ModdersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ModdersController>(ModdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
