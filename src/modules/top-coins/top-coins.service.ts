import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../user/services/user.service';
import { UserFavoriteCoin } from '../user/entities/user-favorite-coin.entity';

@Injectable()
export class TopCoinsService {
  private readonly binanceApiUrl = 'https://api.binance.com/api/v3';

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  async getTopCoins(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.binanceApiUrl}/ticker/24hr`),
      );

      return response.data
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, 3);
    } catch (error) {
      throw new Error('Error fetching data from Binance API');
    }
  }

  async getSpecificCoins(symbols: string[]): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.binanceApiUrl}/ticker/24hr`),
      );

      return response.data.filter((coin) => symbols.includes(coin.symbol));
    } catch (error) {
      throw new Error('Error fetching data from Binance API');
    }
  }

  async getChartData(symbol: string): Promise<any> {
    try {
      const endTime = Date.now();
      const startTime = endTime - 6 * 60 * 60 * 1000; // 6 hours ago

      const response = await lastValueFrom(
        this.httpService.get(`${this.binanceApiUrl}/klines`, {
          params: {
            symbol,
            interval: '1m',
            startTime,
            endTime,
          },
        }),
      );

      return response.data.map((kline) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10],
      }));
    } catch (error) {
      throw new Error('Error fetching chart data from Binance API');
    }
  }

  async getPriceData(
    symbol: string,
    interval: string,
    period: number,
  ): Promise<any> {
    try {
      const endTime = Date.now();

      let startTime;

      switch (interval) {
        case '1h':
          startTime = endTime - period * 60 * 60 * 1000;
          break;
        case '2h':
          startTime = endTime - period * 60 * 60 * 2 * 1000;
          break;
        case '4h':
          startTime = endTime - period * 60 * 60 * 4 * 1000;
          break;
        case '6h':
          startTime = endTime - period * 60 * 60 * 6 * 1000;
          break;
        case '8h':
          startTime = endTime - period * 60 * 60 * 8 * 1000;
          break;
        case '12h':
          startTime = endTime - period * 60 * 60 * 12 * 1000;
          break;
        case '1d':
          startTime = endTime - period * 60 * 60 * 24 * 1000;
          break;
        case '3d':
          startTime = endTime - period * 60 * 60 * 72 * 1000;
          break;
        case '1w':
          startTime = endTime - period * 60 * 60 * 24 * 7 * 1000;
          break;
        case '1M':
          startTime = endTime - period * 60 * 60 * 24 * 30 * 1000;
          break;
        default:
          startTime = endTime - period * 60 * 60 * 24 * 1000;
          break;
      }

      const response = await lastValueFrom(
        this.httpService.get(`${this.binanceApiUrl}/klines`, {
          params: {
            symbol,
            interval,
            startTime,
            endTime,
          },
        }),
      );

      return response.data.map((kline) => ({
        price: kline[4], // closing price
        timestamp: kline[0], // open time
      }));
    } catch (error) {
      throw new Error(
        `Error fetching price data from Binance API ${JSON.stringify(
          error,
          null,
          2,
        )}`,
      );
    }
  }

  async addUserFavoriteCoin(
    userId: string,
    symbol: string,
    name: string,
  ): Promise<UserFavoriteCoin> {
    return this.userService.addUserFavoriteCoin(userId, symbol, name);
  }

  async getUserFavoriteCoins(userId: string): Promise<UserFavoriteCoin[]> {
    return this.userService.getUserFavoriteCoins(userId);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.binanceApiUrl}/ticker/price`, {
          params: { symbol },
        }),
      );

      return parseFloat(response.data.price);
    } catch (error) {
      throw new Error(`Error fetching price for ${symbol}: ${error}`);
    }
  }
}
