import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ModdersService } from './modders.service';
import { CreateModderDto } from './dto/create-modder.dto';
import { UpdateModderDto } from './dto/update-modder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('modders')
export class ModdersController {
  constructor(private readonly moddersService: ModdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Post()
  create(@Body() createModderDto: CreateModderDto, @CurrentUser() user: any) {
    if (user?.role === 'MODDER') {
      createModderDto.modderId = user.id;
    }
    return this.moddersService.create(createModderDto);
  }

  @Get('directory')
  findDirectory() {
    return this.moddersService.findDirectory();
  }

  @Get()
  findAll() {
    return this.moddersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moddersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModderDto: UpdateModderDto,
    @CurrentUser() user: any,
  ) {
    const portfolio: any = await this.moddersService.findOne(id);
    if (user?.role !== 'ADMIN' && portfolio.modderId !== user?.id) {
      throw new ForbiddenException(
        'You are not authorized to update this portfolio item',
      );
    }
    return this.moddersService.update(id, updateModderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const portfolio: any = await this.moddersService.findOne(id);
    if (user?.role !== 'ADMIN' && portfolio.modderId !== user?.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this portfolio item',
      );
    }
    return this.moddersService.remove(id);
  }
}
