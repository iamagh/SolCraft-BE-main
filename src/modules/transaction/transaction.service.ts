// src/transaction/transaction.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction as SolanaTransaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WhitelistedToken } from './entities/whitelisted-token.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { ConfigService } from '@nestjs/config';
import { NotFound } from '../../errors/NotFound';

@Injectable()
export class TransactionService {
  private connection: Connection;

  constructor(
    @InjectRepository(WhitelistedToken)
    private whitelistedTokenRepository: Repository<WhitelistedToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly configService: ConfigService,
  ) {
    this.connection = new Connection(
      this.configService.get('solana.mainnetUrl'),
      'confirmed',
    );
  }

  async whitelistToken(
    symbol: string,
    address: string,
  ): Promise<WhitelistedToken> {
    const token = this.whitelistedTokenRepository.create({ symbol, address });
    return this.whitelistedTokenRepository.save(token);
  }

  async getWhitelistedTokens(): Promise<WhitelistedToken[]> {
    return this.whitelistedTokenRepository.find();
  }

  async performTransaction(
    privateKey: string,
    recipientAddress: string,
    amount: number,
    tokenSymbol: string,
    userUUID: string,
  ): Promise<string> {
    const token = await this.whitelistedTokenRepository.findOne({
      where: { symbol: tokenSymbol },
    });
    if (!token) {
      throw new Error('Token not whitelisted');
    }

    let user = await this.userRepository.findOne({ where: { id: userUUID } });

    if (!user) {
      throw new NotFound('User not found');
    }

    const fromKeypair = Keypair.fromSecretKey(
      Buffer.from(privateKey, 'base64'),
    );
    const toPublicKey = new PublicKey(recipientAddress);
    const transaction = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: amount * LAMPORTS_PER_SOL, // Adjust amount to lamports
      }),
    );
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [fromKeypair],
    );

    const newTransaction = this.transactionRepository.create({
      amount,
      timestamp: new Date(),
      user,
      token,
    });
    await this.transactionRepository.save(newTransaction);

    return signature;
  }
}
