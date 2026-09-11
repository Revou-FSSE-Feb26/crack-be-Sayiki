import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateModderDto {
  @IsUUID('4', { message: 'modderId must be a valid UUID' })
  @IsNotEmpty({ message: 'modderId is required' })
  modderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'imageKey is required' })
  imageKey: string;
}
