import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'rating must be an integer between 1 and 5' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating cannot exceed 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'comment is required' })
  comment: string;

  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  @IsOptional()
  customerId?: string;
}
