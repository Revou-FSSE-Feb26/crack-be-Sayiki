import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) { }

  async create(createListingDto: CreateListingDto) {
    const modder = await this.prisma.user.findUnique({
      where: { id: createListingDto.modderId },
    });

    if (!modder) {
      throw new BadRequestException(
        `Modder with ID ${createListingDto.modderId} does not exist`,
      );
    }

    return this.prisma.service.create({
      data: {
        modderId: createListingDto.modderId,
        title: createListingDto.title,
        description: createListingDto.description,
        basePrice: createListingDto.basePrice,
        category: createListingDto.category,
        imageUrl: createListingDto.imageUrl,
        options:
          createListingDto.options && createListingDto.options.length > 0
            ? {
              create: createListingDto.options.map((opt) => ({
                optionName: opt.optionName,
                optionType: opt.optionType,
                extraPrice: opt.extraPrice ?? 0,
              })),
            }
            : undefined,
      },
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
            avgRating: true,
          },
        },
        options: true,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
            avgRating: true,
          },
        },
        options: true,
      },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.service.findUnique({
      where: { id },
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
            avgRating: true,
          },
        },
        options: true,
      },
    });
    if (!listing) throw new NotFoundException(`Listing with ID ${id} not found`);
    return listing;
  }

  async update(id: string, updateListingDto: UpdateListingDto) {
    await this.findOne(id);

    const { options, ...updateData } = updateListingDto;

    return this.prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            email: true,
            locationCity: true,
            avgRating: true,
          },
        },
        options: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
