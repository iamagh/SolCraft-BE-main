import { Injectable } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  clusterApiUrl,
} from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(
      clusterApiUrl('mainnet-beta'),
      'confirmed',
    );
  }

  async transferSolana(
    fromPrivateKey: string,
    toPublicKey: string,
    amountInSol: number,
  ) {
    const fromWallet = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fromPrivateKey)),
    );
    const toWallet = new PublicKey(toPublicKey);
    const lamports = amountInSol * 1e9;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toWallet,
        lamports,
      }),
    );

    const signature = await this.connection.sendTransaction(transaction, [
      fromWallet,
    ]);
    await this.connection.confirmTransaction(signature);

    return signature;
  }
}
