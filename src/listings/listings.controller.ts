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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Post()
  create(@Body() createListingDto: CreateListingDto, @CurrentUser() user: any) {
    if (user?.role === 'MODDER') {
      createListingDto.modderId = user.id;
    }
    return this.listingsService.create(createListingDto);
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @CurrentUser() user: any,
  ) {
    const listing = await this.listingsService.findOne(id);
    if (user?.role !== 'ADMIN' && listing.modderId !== user?.id) {
      throw new ForbiddenException(
        'You are not authorized to update this service listing',
      );
    }
    return this.listingsService.update(id, updateListingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODDER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const listing = await this.listingsService.findOne(id);
    if (user?.role !== 'ADMIN' && listing.modderId !== user?.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this service listing',
      );
    }
    return this.listingsService.remove(id);
  }
}
