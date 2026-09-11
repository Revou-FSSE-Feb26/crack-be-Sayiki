import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingDeliveryMethod } from '@prisma/client';

export class CreateBookingItemDto {
  @IsUUID('4', { message: 'serviceId must be a valid UUID' })
  @IsNotEmpty({ message: 'serviceId is required' })
  serviceId: string;

  @IsObject()
  @IsOptional()
  selectedOptions?: Record<string, any>;

  @IsNumber()
  @Min(0, { message: 'subTotal must be 0 or greater' })
  subTotal: number;
}

export class CreateOrderDto {
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  @IsNotEmpty({ message: 'customerId is required' })
  customerId: string;

  @IsUUID('4', { message: 'modderId must be a valid UUID' })
  @IsNotEmpty({ message: 'modderId is required' })
  modderId: string;

  @IsString()
  @IsNotEmpty({ message: 'keyboardModel is required' })
  keyboardModel: string;

  @IsEnum(BookingDeliveryMethod, {
    message: 'deliveryMethod must be either COURIER or WALK_IN',
  })
  deliveryMethod: BookingDeliveryMethod;

  @IsNumber()
  @Min(0, { message: 'totalPrice must be 0 or greater' })
  totalPrice: number;

  @IsDateString(
    {},
    { message: 'bookingDate must be a valid ISO-8601 date string' },
  )
  @IsNotEmpty({ message: 'bookingDate is required' })
  bookingDate: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'proposedDate must be a valid ISO-8601 date string' },
  )
  proposedDate?: string;

  @IsOptional()
  @IsString()
  paymentProof?: string;

  @IsOptional()
  @IsString()
  inboundTrackingNum?: string;

  @IsOptional()
  @IsString()
  outboundTrackingNum?: string;

  @IsArray({ message: 'items must be an array' })
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateBookingItemDto)
  items: CreateBookingItemDto[];
}
