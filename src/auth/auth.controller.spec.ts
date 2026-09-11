import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      role: Role.CUSTOMER,
      locationCity: 'Jakarta',
    };
    mockAuthService.register.mockResolvedValue({
      message: 'User registered successfully',
      user: { id: '1', ...dto },
    });

    const res = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(res.message).toBe('User registered successfully');
  });

  it('should call authService.login', async () => {
    const dto = { email: 'test@example.com', password: 'password123' };
    mockAuthService.login.mockResolvedValue({
      access_token: 'fake-jwt',
      user: { id: '1', email: 'test@example.com' },
    });

    const res = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(res.access_token).toBe('fake-jwt');
  });

  it('should call authService.getProfile', async () => {
    const req = { user: { id: 'u-123' } };
    mockAuthService.getProfile.mockResolvedValue({
      id: 'u-123',
      email: 'test@example.com',
    });

    const res = await controller.getProfile(req);
    expect(authService.getProfile).toHaveBeenCalledWith('u-123');
    expect(res.id).toBe('u-123');
  });
});
