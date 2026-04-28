import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity()
export class PetType extends BaseEntity {
  @Column()
  code: string;

  @Column()
  label: string;
}
