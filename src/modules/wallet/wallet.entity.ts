import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  ManyToOne,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Base } from '../base/base.entity';
import { User } from '../user/entities/user.entity';

@Entity('wallet')
export class WalletEntity extends Base {
  @Column({ unique: true })
  name: string | null;

  @Column({ unique: true })
  address: string | null;

  @Column({ nullable: true /*, transformer: new EncryptionTransformer()*/ })
  @Exclude({ toPlainOnly: true })
  privateKey: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  isDeleted: Date;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User;

  @BeforeInsert()
  async hashPassword() {
    if (this.privateKey) {
      this.privateKey = await bcrypt.hash(this.privateKey, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.privateKey) {
      this.privateKey = await bcrypt.hash(this.privateKey, 10);
    }
  }
}
