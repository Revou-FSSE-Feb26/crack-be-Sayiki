import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(BookingStatus, {
    message:
      'status must be UNPAID, PENDING_ADMIN_VERIFICATION, PAID_WAITING_MODDER, CUSTOMER_SENDING_KEYBOARD, KEYBOARD_IN_MODDER_HAND, SHIPPED_BACK, SUCCESS, or UNDER_DISPUTE',
  })
  status?: BookingStatus;

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

  @IsOptional()
  @IsBoolean()
  isDisbursed?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'disbursedAt must be a valid ISO-8601 date string' },
  )
  disbursedAt?: string;
}
