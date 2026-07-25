import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.booking.create({
      data: createOrderDto as any,
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        modder: { select: { name: true, email: true } },
        items: {
          include: {
            service: { select: { title: true, basePrice: true } },
          },
        },
        review: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.booking.findUnique({
      where: { id },
      include: { customer: true, modder: true, items: true, review: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.booking.update({
      where: { id },
      data: updateOrderDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
