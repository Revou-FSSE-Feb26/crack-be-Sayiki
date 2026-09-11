import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { ListingsModule } from './listings/listings.module';
import { UsersModule } from './users/users.module';
import { ModdersModule } from './modders/modders.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrdersModule,
    ListingsModule,
    UsersModule,
    ModdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
