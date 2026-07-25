import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateModderDto } from './dto/create-modder.dto';
import { UpdateModderDto } from './dto/update-modder.dto';

@Injectable()
export class ModdersService {
  constructor(private prisma: PrismaService) {}

  async create(createModderDto: CreateModderDto) {
    return this.prisma.portfolio.create({
      data: createModderDto as any,
    });
  }

  async findAll() {
    return this.prisma.portfolio.findMany({
      include: {
        modder: {
          select: {
            name: true,
            locationCity: true,
            email: true,
            avgRating: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const modder = await this.prisma.portfolio.findUnique({
      where: { id },
      include: { modder: true },
    });
    if (!modder) throw new NotFoundException('Portfolio not found');
    return modder;
  }

  async update(id: string, updateModderDto: UpdateModderDto) {
    return this.prisma.portfolio.update({
      where: { id },
      data: updateModderDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.portfolio.delete({
      where: { id },
    });
  }
}
