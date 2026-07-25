import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator';

export enum ListingType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

export class CreateListingDto {
  @IsString()
  modderId: string;

  @IsEnum(ListingType)
  type: ListingType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsString()
  unitLabel?: string; // e.g. "per switch" or null

  @IsOptional()
  @IsNumber()
  stock?: number; // null for services, exact count for ready stock

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
