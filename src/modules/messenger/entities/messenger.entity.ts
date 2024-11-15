import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from '../../base/base.entity';
import { User } from '../../user/entities/user.entity';
import { MessageEntity } from './message.entity';

@Entity('messenger')
export class MessengerEntity extends Base {
  @ManyToOne(() => User, (user) => user.messengers)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @ManyToOne(() => User, (user) => user.messengers)
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @OneToMany(() => MessageEntity, (message) => message.messenger)
  messages: MessageEntity[];
}
