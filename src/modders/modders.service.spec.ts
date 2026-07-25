import { Test, TestingModule } from '@nestjs/testing';
import { ModdersService } from './modders.service';

describe('ModdersService', () => {
  let service: ModdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModdersService],
    }).compile();

    service = module.get<ModdersService>(ModdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
