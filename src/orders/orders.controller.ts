import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    if (user?.role === 'CUSTOMER') {
      createOrderDto.customerId = user.id;
    }
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('customerId') customerId?: string,
    @Query('modderId') modderId?: string,
  ) {
    if (user?.role === 'CUSTOMER') {
      return this.ordersService.findAll({ customerId: user.id });
    }
    if (user?.role === 'MODDER') {
      return this.ordersService.findAll({ modderId: user.id });
    }
    return this.ordersService.findAll({ customerId, modderId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(id);
    if (
      user?.role !== 'ADMIN' &&
      order.customerId !== user?.id &&
      order.modderId !== user?.id
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this booking',
      );
    }
    return order;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.findOne(id);
    if (
      user?.role !== 'ADMIN' &&
      order.customerId !== user?.id &&
      order.modderId !== user?.id
    ) {
      throw new ForbiddenException(
        'You are not authorized to update this booking',
      );
    }
    return this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @Post(':id/review')
  async addReview(
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.findOne(id);
    if (user?.role !== 'ADMIN' && order.customerId !== user?.id) {
      throw new ForbiddenException(
        'You can only review bookings for your own completed orders',
      );
    }
    if (user?.role === 'CUSTOMER') {
      createReviewDto.customerId = user.id;
    }
    return this.ordersService.addReview(id, createReviewDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
