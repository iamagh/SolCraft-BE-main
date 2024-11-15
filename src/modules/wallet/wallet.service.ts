import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  SystemProgram,
  PublicKey,
  TransactionMessage,
} from '@solana/web3.js';
import * as bip39 from 'bip39';
import * as bs58 from 'bs58';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { WalletEntity } from './wallet.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { TopCoinsService } from '../top-coins/top-coins.service';

@Injectable()
export class WalletService {
  private connection: Connection;

  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    private readonly topCoinsService: TopCoinsService,
    private readonly configService: ConfigService,
  ) {
    this.connection = new Connection(
      clusterApiUrl('mainnet-beta'),
      'confirmed',
    );
  }

  async generateWallet(user: User, walletName: string) {
    const walletExists = await this.walletRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (walletExists) {
      throw new Error('User already has one');
    }

    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const address = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);

    const newWallet = new WalletEntity();

    newWallet.address = address;
    newWallet.privateKey = privateKey;
    newWallet.user = user;
    newWallet.name = walletName;

    const { id } = await this.walletRepository.save(newWallet);

    return {
      id,
      address,
      privateKey,
      mnemonic,
    };
  }

  getWallets(user: User) {
    return this.walletRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      select: ['id', 'address', 'name'],
    });
  }

  async importWallet(user: User, importWalletDto: ImportWalletDto) {
    const { privateKey, name } = importWalletDto;
    try {
      const decodedKey = bs58.decode(privateKey);
      const keypair = Keypair.fromSecretKey(decodedKey);
      const address = keypair.publicKey.toBase58();

      const existingWallet = await this.walletRepository.findOne({
        where: {
          address,
          user: {
            id: user.id,
          },
        },
      });

      if (existingWallet) {
        throw new Error();
      }

      const newWallet = new WalletEntity();

      newWallet.address = address;
      newWallet.privateKey = privateKey;
      newWallet.user = user;
      newWallet.name = name;

      const { id } = await this.walletRepository.save(newWallet);

      return {
        id,
        address,
      };
    } catch (error) {
      throw new Error('Invalid private key or wallet could not be imported.');
    }
  }

  async sendTransaction(
    fromAddress: string,
    privateKey: string,
    toAddress: string,
    amount: string,
  ) {
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    const toPublicKey = new PublicKey(toAddress);
    const blockhash = await this.connection.getLatestBlockhash();

    const instruction = SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: Number(amount) * LAMPORTS_PER_SOL,
    });

    const messageV0 = new TransactionMessage({
      payerKey: fromKeypair.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([fromKeypair]);

    const serializedTransaction = transaction.serialize();
    return await this.connection.sendRawTransaction(serializedTransaction);
  }

  async getWalletBalances(user: User) {
    const wallet = await this.walletRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      select: ['id', 'address'],
    });

    if (!wallet) {
      throw new Error('Wallet not found for this user.');
    }

    const publicKey = new PublicKey(wallet.address);

    const solBalance = await this.connection.getBalance(publicKey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;

    const solPriceInUSD = await this.topCoinsService.getCurrentPrice('SOLUSDT');
    const solValueInUSD = solAmount * solPriceInUSD;

    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: new PublicKey(
          this.configService.get('solana.tokenProgramId'),
        ),
      },
    );

    const tokenList = await fetch(
      this.configService.get('solana.tokenListUrl'),
    ).then((res) => res.json());

    const tokens = await Promise.all(
      tokenAccounts.value.map(async (tokenAccount) => {
        const tokenInfo = tokenAccount.account.data.parsed.info;
        const mint = tokenInfo.mint;
        const amount = tokenInfo.tokenAmount.uiAmount;

        const tokenDetails = tokenList.tokens.find((t) => t.address === mint);
        const tokenSymbol = tokenDetails
          ? tokenDetails.symbol
          : 'Unknown Token';
        const tokenName = tokenDetails ? tokenDetails.name : 'Unknown Token';
        const logo = tokenDetails ? tokenDetails.logoURI : 'Unknown Token';

        let tokenPriceInUSD = 0;
        if (tokenSymbol !== 'Unknown Token') {
          tokenPriceInUSD = await this.topCoinsService.getCurrentPrice(
            `${tokenSymbol}USDT`,
          );
        }
        const tokenValueInUSD = amount * tokenPriceInUSD;

        return {
          mint,
          name: tokenName,
          symbol: tokenSymbol,
          amount,
          logo,
          valueInUSD: parseFloat(tokenValueInUSD.toFixed(2)),
        };
      }),
    );

    return {
      address: wallet.address,
      sol: solAmount,
      solValueInUSD: parseFloat(solValueInUSD.toFixed(2)),
      tokens,
    };
  }

  async getUserPublicKey(seller: User): Promise<string> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: seller.id } },
      select: ['id', 'address'],
    });

    if (!wallet) {
      throw new NotFoundException('Seller wallet not found');
    }

    return wallet.address;
  }

  async getUserPrivateKey(user: User): Promise<{ privateKey: string }> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
      select: ['privateKey'],
    });

    if (!wallet) {
      throw new NotFoundException('Buyer wallet not found');
    }

    return { privateKey: wallet.privateKey };
  }
}
