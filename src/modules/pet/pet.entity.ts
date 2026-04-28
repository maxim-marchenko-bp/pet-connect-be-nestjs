import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { PetType } from '../pet-type.entity';
import { User } from '../user/user.entity';

@Entity()
export class Pet extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @ManyToOne(() => PetType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'type_id' })
  type: PetType;

  @ManyToMany(() => User, (user) => user.pets)
  users: User[];
}
