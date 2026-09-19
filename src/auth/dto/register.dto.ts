import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsIn([Role.CUSTOMER, Role.MODDER], {
    message: 'Role must be either CUSTOMER or MODDER. ADMIN registration is forbidden.',
  })
  @IsOptional()
  role?: Role = Role.CUSTOMER;

  @IsString()
  @IsNotEmpty({ message: 'Location city is required' })
  locationCity: string;
}
