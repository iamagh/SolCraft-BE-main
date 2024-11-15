import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopCoinsService } from './top-coins.service';
import { TopCoinsController } from './top-coins.controller';
import { UserFavoriteCoin } from '../user/entities/user-favorite-coin.entity';
import { UserModule } from '../user/user.module';
import { BinanceWebSocketService } from './binance-websocket.service';
import { TopCoinsGateway } from './top-coins.gateway';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserFavoriteCoin]),
    UserModule,
  ],
  providers: [TopCoinsService /*, BinanceWebSocketService, TopCoinsGateway*/],
  controllers: [TopCoinsController],
  exports: [TopCoinsService],
})
export class TopCoinsModule {}
