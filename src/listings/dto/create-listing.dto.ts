import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory, ServiceOptionType } from '@prisma/client';

export class CreateServiceOptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Option name is required' })
  optionName: string;

  @IsEnum(ServiceOptionType, {
    message:
      'Option type must be LUBE_TYPE, NEW_SWITCH, ADDON_SERVICE, or FOAM_TYPE',
  })
  optionType: ServiceOptionType;

  @IsNumber()
  @Min(0, { message: 'Extra price must be 0 or greater' })
  @IsOptional()
  extraPrice?: number = 0;
}

export class CreateListingDto {
  @IsUUID('4', { message: 'modderId must be a valid UUID' })
  @IsNotEmpty({ message: 'modderId is required' })
  modderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber()
  @Min(0, { message: 'basePrice must be 0 or greater' })
  basePrice: number;

  @IsEnum(ServiceCategory, {
    message:
      'Category must be CASE_AND_ACOUSTIC, SWITCH_MODS, STABILIZER_MODS, or CUSTOMIZATION_AESTHETICS',
  })
  category: ServiceCategory;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOptionDto)
  options?: CreateServiceOptionDto[];
}
