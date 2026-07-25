import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModdersService } from './modders.service';
import { CreateModderDto } from './dto/create-modder.dto';
import { UpdateModderDto } from './dto/update-modder.dto';

@Controller('modders')
export class ModdersController {
  constructor(private readonly moddersService: ModdersService) {}

  @Post()
  create(@Body() createModderDto: CreateModderDto) {
    return this.moddersService.create(createModderDto);
  }

  @Get()
  findAll() {
    return this.moddersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moddersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModderDto: UpdateModderDto) {
    return this.moddersService.update(id, updateModderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moddersService.remove(id);
  }
}
