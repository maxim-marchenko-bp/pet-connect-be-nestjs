import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pet } from '../pet/pet.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @ManyToMany(() => Pet, (pet) => pet.users)
  @JoinTable({
    name: 'user_pets',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pet_id', referencedColumnName: 'id' },
  })
  pets: Pet[];
}
