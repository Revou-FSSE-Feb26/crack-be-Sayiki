import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateModderDto } from './dto/create-modder.dto';
import { UpdateModderDto } from './dto/update-modder.dto';

@Injectable()
export class ModdersService {
  constructor(private prisma: PrismaService) {}

  async create(createModderDto: CreateModderDto) {
    const modder = await this.prisma.user.findUnique({
      where: { id: createModderDto.modderId },
    });

    if (!modder) {
      throw new BadRequestException(
        `Modder with ID ${createModderDto.modderId} does not exist`,
      );
    }

    return this.prisma.portfolio.create({
      data: createModderDto,
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
      },
    });
  }

  async findAll() {
    return this.prisma.portfolio.findMany({
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            locationCity: true,
            email: true,
            avgRating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            locationCity: true,
            email: true,
            avgRating: true,
          },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio item with ID ${id} not found`);
    }

    return portfolio;
  }

  async update(id: string, updateModderDto: UpdateModderDto) {
    await this.findOne(id);

    return this.prisma.portfolio.update({
      where: { id },
      data: updateModderDto,
      include: {
        modder: {
          select: {
            id: true,
            name: true,
            locationCity: true,
            email: true,
            avgRating: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.portfolio.delete({
      where: { id },
    });
  }
}
