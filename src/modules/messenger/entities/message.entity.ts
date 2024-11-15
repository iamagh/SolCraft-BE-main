import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from '../../base/base.entity';
import { User } from '../../user/entities/user.entity';
import { MessengerEntity } from './messenger.entity';

@Entity('message')
export class MessageEntity extends Base {
  @ManyToOne(() => MessengerEntity, (messenger) => messenger.messages)
  @JoinColumn({ name: 'messengerId' })
  messenger: MessengerEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  editedMessages?: string[];

  @Column({ type: 'boolean', default: false })
  seen: boolean;
}
