import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { Base } from '../../base/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('plots')
export class PlotsEntity extends Base {
  @Index()
  @Column({ unique: true })
  blockPosHash: string;

  @Column()
  positionData: string;

  @Column({ nullable: true })
  price: number;

  @ManyToOne(() => User, (user) => user.plots)
  user: User;
}
