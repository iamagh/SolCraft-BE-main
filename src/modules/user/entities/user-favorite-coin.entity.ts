import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_favorite_coin')
export class UserFavoriteCoin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favoriteCoins)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  symbol: string;

  @Column()
  name: string;
}
