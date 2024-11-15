import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinecraftController } from './minecraft.controller';
import { MinecraftService } from './minecraft.service';
import { SolanaModule } from '../solana/solana.module';
import { PlotsEntity } from './entities/plots.entity';
import { PlayerValidationGuard } from './guards/player-validation.guard';
import { UserModule } from '../user/user.module'; // Import UserModule
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlotsEntity]),
    SolanaModule,
    HttpModule,
    WalletModule,
    UserModule,
  ],
  controllers: [MinecraftController],
  providers: [
    MinecraftService,
    {
      provide: APP_GUARD,
      useClass: PlayerValidationGuard,
    },
  ],
  exports: [MinecraftService],
})
export class MinecraftModule {}
