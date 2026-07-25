import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ListingsModule } from './listings/listings.module';
import { UsersModule } from './users/users.module';
import { ModdersModule } from './modders/modders.module';

@Module({
  imports: [OrdersModule, ListingsModule, UsersModule, ModdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
