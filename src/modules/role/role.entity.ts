import { Column, Entity, Index, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Base } from 'src/modules/base/base.entity';

@Entity('role')
export class Role extends Base {
  @Index()
  @Column({ nullable: false, unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users?: User[] | null;
}
