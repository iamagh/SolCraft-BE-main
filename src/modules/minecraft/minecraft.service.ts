import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PlotsEntity } from './entities/plots.entity';
import { Repository } from 'typeorm';
import { SolanaService } from '../solana/solana.service';
import { User } from '../user/entities/user.entity';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class MinecraftService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PlotsEntity)
    private readonly plotsRepository: Repository<PlotsEntity>,
    private readonly solanaService: SolanaService,
    private readonly walletService: WalletService,
  ) {}

  async getServerDetails(): Promise<{
    serverAddress: string;
    serverPort: number;
    mapId: string;
  }> {
    return {
      serverAddress: this.configService.get('serverAddress'),
      serverPort: this.configService.get('serverPort'),
      mapId: this.configService.get('mapId'),
    };
  }

  getAll() {
    return this.plotsRepository.find();
  }

  async createOne(
    { blockPosHash, corner1, corner2, playerId }: CheckAvailabilityDto,
    user: User,
  ) {
    const newPlot = this.plotsRepository.create({
      blockPosHash,
      positionData: JSON.stringify({
        corner1,
        corner2,
        playerId,
      }),
      user: user,
    });

    const { positionData } = await this.plotsRepository.save(newPlot);

    return {
      positionData,
      blockPosHash,
    };
  }

  checkAvailability({ blockPosHash }: CheckAvailabilityDto) {
    return this.plotsRepository.findOne({
      where: { blockPosHash },
    });
  }

  async handleLandPurchase(
    buyer: User,
    sellerPublicKey: string,
    price: number,
  ) {
    const buyerWallet = await this.walletService.getUserPrivateKey(buyer);

    await this.solanaService.transferSolana(
      buyerWallet.privateKey,
      sellerPublicKey,
      price,
    );
  }
}
