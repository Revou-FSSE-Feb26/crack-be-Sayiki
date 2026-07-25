import { Module } from '@nestjs/common';
import { ModdersService } from './modders.service';
import { ModdersController } from './modders.controller';

@Module({
  controllers: [ModdersController],
  providers: [ModdersService],
})
export class ModdersModule {}
