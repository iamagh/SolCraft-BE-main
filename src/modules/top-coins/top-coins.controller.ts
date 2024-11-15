import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { TopCoinsService } from './top-coins.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RoleGuard } from '../role/role.guard';
import { RoleEnum } from '../role/role.enum';
import { Roles } from '../role/role.decorator';
import { User } from '../user/entities/user.entity';

@Controller('top-coins')
@ApiTags('Top coins')
export class TopCoinsController {
  constructor(private readonly topCoinsService: TopCoinsService) {}

  // @Get()
  // async getTopCoins() {
  //   return this.topCoinsService.getTopCoins();
  // }
  //
  // @Get('specific')
  // async getSpecificCoins(@Query('symbols') symbols: string) {
  //   const symbolsArray = symbols.split(',');
  //   return this.topCoinsService.getSpecificCoins(symbolsArray);
  // }
  //
  // @Get('chart-data')
  // async getChartData(@Query('symbol') symbol: string) {
  //   return this.topCoinsService.getChartData(symbol);
  // }

  @Get('price-data')
  async getPriceData(
    // @Request() { user }: { user: User },
    @Query('symbol') symbol: string,
    @Query('interval') interval: string,
    @Query('period') period: number,
  ) {
    return this.topCoinsService.getPriceData(symbol, interval, period);
  }
}
