import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { MinecraftService } from './minecraft.service';
import { join } from 'path';
import { User } from '../user/entities/user.entity';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { PlayerValidationRequired } from './decorators/player-validation.decorator';
import { UserService } from '../user/services/user.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('minecraft')
export class MinecraftController {
  constructor(
    private readonly minecraftService: MinecraftService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  @Get('start')
  async startMinecraft() {
    return await this.minecraftService.getServerDetails();
  }

  @Get('mod')
  async downloadMod(@Res() res: any) {
    const modFilePath = join(__dirname, '..', 'mods', 'your_mod.jar'); // Path to the mod file
    return res.download(modFilePath);
  }

  @Get()
  @PlayerValidationRequired()
  getAll() {
    return this.minecraftService.getAll();
  }

  @Post()
  @PlayerValidationRequired()
  create(
    @Request() { user }: { user: User },
    @Body() lmCheckAvailabilityDto: CheckAvailabilityDto,
  ) {
    return this.minecraftService.createOne(lmCheckAvailabilityDto, user);
  }

  @Post('check-availability')
  @PlayerValidationRequired()
  checkAvailability(@Body() lmCheckAvailabilityDto: CheckAvailabilityDto) {
    return this.minecraftService.checkAvailability(lmCheckAvailabilityDto);
  }

  @Post('buy-land')
  @PlayerValidationRequired()
  async buyLand(
    @Request() { user }: { user: User },
    @Body() { sellerId, price }: { sellerId: string; price: number },
  ) {
    const seller = await this.userService.findByMinecraftId(sellerId);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const sellerPublicKey = await this.walletService.getUserPublicKey(seller);

    return this.minecraftService.handleLandPurchase(
      user,
      sellerPublicKey,
      price,
    );
  }
}
