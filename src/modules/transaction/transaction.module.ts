import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WhitelistedToken } from './entities/whitelisted-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, WhitelistedToken])],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
