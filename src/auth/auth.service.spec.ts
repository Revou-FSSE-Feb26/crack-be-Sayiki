import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email is already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await expect(
        service.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: Role.CUSTOMER,
          locationCity: 'Jakarta',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'u-123',
        name: 'Test User',
        email: 'test@example.com',
        role: Role.CUSTOMER,
        isVerified: false,
        locationCity: 'Jakarta',
        avgRating: 0,
        createdAt: new Date(),
      });

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.CUSTOMER,
        locationCity: 'Jakarta',
      });

      expect(result.message).toBe('User registered successfully');
      expect(result.user.id).toBe('u-123');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      const createCallArg = mockPrismaService.user.create.mock.calls[0][0];
      // Assert password in database create call is hashed (not plain text)
      expect(createCallArg.data.password).not.toBe('password123');
      expect(createCallArg.data.password.startsWith('$2')).toBe(true);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: Role.CUSTOMER,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access_token and user profile when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u-1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: Role.CUSTOMER,
        isVerified: true,
        locationCity: 'Jakarta',
        avgRating: 0,
        createdAt: new Date(),
      });
      mockJwtService.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(result.access_token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('getProfile', () => {
    it('should return user when found', async () => {
      const userObj = {
        id: 'u-1',
        name: 'Test User',
        email: 'test@example.com',
        role: Role.CUSTOMER,
        isVerified: true,
        locationCity: 'Jakarta',
        avgRating: 0,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userObj);

      const result = await service.getProfile('u-1');
      expect(result).toEqual(userObj);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
