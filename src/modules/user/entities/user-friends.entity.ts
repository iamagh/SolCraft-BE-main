import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from '../../base/base.entity';
import { User } from './user.entity';

@Entity('user_friends')
export class UserFriends extends Base {
  @ManyToOne(() => User, (user) => user.friends)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @Column({ type: 'boolean', default: false })
  isAccepted: boolean;
}
