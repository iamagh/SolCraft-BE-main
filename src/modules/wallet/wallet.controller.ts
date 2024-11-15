import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { User } from '../user/entities/user.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RoleGuard } from '../role/role.guard';
import { RoleEnum } from '../role/role.enum';
import { Roles } from '../role/role.decorator';
import { ImportWalletDto } from './dto/import-wallet.dto';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('wallet')
@ApiTags('Wallet')
@UseGuards(JwtAccessGuard, RoleGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(RoleEnum.CLIENT)
  listWallets(@Request() { user }: { user: User }) {
    return this.walletService.getWallets(user);
  }

  @Post('generate')
  @Roles(RoleEnum.CLIENT)
  generateWallet(
    @Request() { user }: { user: User },
    @Body('name') name: string,
  ) {
    return this.walletService.generateWallet(user, name);
  }

  @Post('import')
  @Roles(RoleEnum.CLIENT)
  importWallet(
    @Request() { user }: { user: User },
    @Body() importWalletDto: ImportWalletDto,
  ) {
    return this.walletService.importWallet(user, importWalletDto);
  }

  @Get('data')
  @Roles(RoleEnum.CLIENT)
  getWalletData(@Request() { user }: { user: User }) {
    return this.walletService.getWalletBalances(user);
  }
}
