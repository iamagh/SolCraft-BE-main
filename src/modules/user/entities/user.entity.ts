import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Base } from '../../base/base.entity';
import { Role } from '../../role/role.entity';
import { WalletEntity } from '../../wallet/wallet.entity';
import { UserFriends } from './user-friends.entity';
import { MessengerEntity } from '../../messenger/entities/messenger.entity';
import { UserFavoriteCoin } from './user-favorite-coin.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { PlotsEntity } from '../../minecraft/entities/plots.entity';

@Entity('user')
export class User extends Base {
  @Index()
  @Column({ nullable: false, unique: true })
  email: string | null;

  @Index()
  @Column({ nullable: false, unique: true })
  username: string;

  @Index()
  @Column({ nullable: true, unique: true })
  minecraftId: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string | null;




  @Index()
  @Column({ nullable: true })
  firstName: string | null;

  @Index()
  @Column({ nullable: true })
  lastName: string | null;

  @Index()
  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  identifier: string | null;

  @Index()
  @Column({ nullable: true })
  mc_code: string | null;

  @ManyToOne(() => Role)
  role?: Role | null;

  @OneToMany(() => WalletEntity, (wallet) => wallet.user)
  wallets: WalletEntity[];

  @OneToMany(() => UserFriends, (userFriends) => userFriends.user)
  friends: UserFriends[];

  @OneToMany(() => MessengerEntity, (messenger) => messenger.user1)
  messengers: MessengerEntity[];

  @OneToMany(() => UserFriends, (userFriends) => userFriends.friend)
  friendRequests: UserFriends[];

  @OneToMany(() => PlotsEntity, (plot) => plot.user)
  plots: PlotsEntity[];

  @OneToMany(
    () => UserFavoriteCoin,
    (userFavoriteCoin) => userFavoriteCoin.user,
  )
  favoriteCoins: UserFavoriteCoin[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @Column({ nullable: true, type: 'timestamptz', default: null })
  blockedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
