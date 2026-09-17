import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.prisma.user.findUnique({
      where: { id: createOrderDto.customerId },
    });
    if (!customer) {
      throw new BadRequestException(
        `Customer with ID ${createOrderDto.customerId} not found`,
      );
    }

    const modder = await this.prisma.user.findUnique({
      where: { id: createOrderDto.modderId },
    });
    if (!modder) {
      throw new BadRequestException(
        `Modder with ID ${createOrderDto.modderId} not found`,
      );
    }

    const bookingDate = new Date(createOrderDto.bookingDate);

    const existingBooking = await this.prisma.booking.findUnique({
      where: {
        modderId_bookingDate: {
          modderId: createOrderDto.modderId,
          bookingDate,
        },
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        'Modder is already booked for this specific date and time slot',
      );
    }

    return this.prisma.booking.create({
      data: {
        customerId: createOrderDto.customerId,
        modderId: createOrderDto.modderId,
        keyboardModel: createOrderDto.keyboardModel,
        deliveryMethod: createOrderDto.deliveryMethod,
        totalPrice: createOrderDto.totalPrice,
        bookingDate,
        status: createOrderDto.paymentProof
          ? BookingStatus.PENDING_ADMIN_VERIFICATION
          : BookingStatus.UNPAID,
        proposedDate: createOrderDto.proposedDate
          ? new Date(createOrderDto.proposedDate)
          : null,
        paymentProof: createOrderDto.paymentProof,
        inboundTrackingNum: createOrderDto.inboundTrackingNum,
        outboundTrackingNum: createOrderDto.outboundTrackingNum,
        items: {
          create: createOrderDto.items.map((item) => ({
            serviceId: item.serviceId,
            selectedOptions: item.selectedOptions ?? {},
            subTotal: item.subTotal,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        modder: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            service: { select: { id: true, title: true, basePrice: true } },
          },
        },
      },
    });
  }

  async findAll(filter?: { customerId?: string; modderId?: string }) {
    const where: any = {};
    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }
    if (filter?.modderId) {
      where.modderId = filter.modderId;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, locationCity: true } },
        modder: { select: { id: true, name: true, email: true, locationCity: true } },
        items: {
          include: {
            service: { select: { id: true, title: true, basePrice: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
          },
        },
        modder: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
          },
        },
        items: {
          include: {
            service: true,
          },
        },
        review: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: updateOrderDto.status,
        proposedDate: updateOrderDto.proposedDate
          ? new Date(updateOrderDto.proposedDate)
          : undefined,
        paymentProof: updateOrderDto.paymentProof,
        inboundTrackingNum: updateOrderDto.inboundTrackingNum,
        outboundTrackingNum: updateOrderDto.outboundTrackingNum,
        isDisbursed: updateOrderDto.isDisbursed !== undefined ? updateOrderDto.isDisbursed : undefined,
        disbursedAt: updateOrderDto.disbursedAt
          ? new Date(updateOrderDto.disbursedAt)
          : updateOrderDto.isDisbursed
          ? new Date()
          : undefined,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        modder: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async addReview(bookingId: string, createReviewDto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException(`Order with ID ${bookingId} not found`);
    }

    let review;
    if (booking.review) {
      review = await this.prisma.review.update({
        where: { bookingId },
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
        },
      });
    } else {
      review = await this.prisma.review.create({
        data: {
          bookingId,
          customerId: createReviewDto.customerId || booking.customerId,
          modderId: booking.modderId,
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
        },
      });
    }

    // Recalculate and update modder's avgRating
    const allModderReviews = await this.prisma.review.findMany({
      where: { modderId: booking.modderId },
      select: { rating: true },
    });
    if (allModderReviews.length > 0) {
      const avg = allModderReviews.reduce((sum, r) => sum + r.rating, 0) / allModderReviews.length;
      await this.prisma.user.update({
        where: { id: booking.modderId },
        data: { avgRating: parseFloat(avg.toFixed(1)) },
      });
    }

    return review;
  }
}
