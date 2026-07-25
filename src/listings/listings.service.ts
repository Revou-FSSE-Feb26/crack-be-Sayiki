import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ServiceCategory } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(createListingDto: CreateListingDto) {
    const categoryMap: Record<string, ServiceCategory> = {
      SERVICE: ServiceCategory.SWITCH_MODS,
      PRODUCT: ServiceCategory.CUSTOMIZATION_AESTHETICS,
    };

    return this.prisma.service.create({
      data: {
        modderId: createListingDto.modderId,
        title: createListingDto.title,
        description: createListingDto.description,
        basePrice: createListingDto.basePrice,
        category: categoryMap[createListingDto.type],
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        modder: {
          include: {
            services: {
              select: { id: true, title: true },
            },
          },
        },
        options: true,
      },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.service.findUnique({
      where: { id },
      include: { modder: true, options: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(id: string, updateListingDto: UpdateListingDto) {
    return this.prisma.service.update({
      where: { id },
      data: {
        ...(updateListingDto as any),
        ...((updateListingDto as any).type
          ? {
              category:
                (updateListingDto as any).type === 'SERVICE'
                  ? ServiceCategory.SWITCH_MODS
                  : ServiceCategory.CUSTOMIZATION_AESTHETICS,
            }
          : {}),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
