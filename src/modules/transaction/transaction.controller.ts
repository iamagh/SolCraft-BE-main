// src/transaction/transaction.controller.ts

import { Controller, Post, Body, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { WhitelistedToken } from './entities/whitelisted-token.entity';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async performTransaction(
    @Body('privateKey') privateKey: string,
    @Body('recipientAddress') recipientAddress: string,
    @Body('amount') amount: number,
    @Body('tokenSymbol') tokenSymbol: string,
    @Body('userUUID') userUUID: string,
  ): Promise<{ transactionId: string }> {
    const transactionId = await this.transactionService.performTransaction(
      privateKey,
      recipientAddress,
      amount,
      tokenSymbol,
      userUUID,
    );
    return { transactionId };
  }

  @Post('whitelist-token')
  async whitelistToken(
    @Body('symbol') symbol: string,
    @Body('address') address: string,
  ): Promise<WhitelistedToken> {
    return this.transactionService.whitelistToken(symbol, address);
  }

  @Get('whitelisted-tokens')
  async getWhitelistedTokens(): Promise<WhitelistedToken[]> {
    return this.transactionService.getWhitelistedTokens();
  }
}
