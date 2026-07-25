import { PartialType } from '@nestjs/mapped-types';
import { CreateModderDto } from './create-modder.dto';

export class UpdateModderDto extends PartialType(CreateModderDto) {}
