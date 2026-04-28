import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class RefreshToken extends BaseEntity {
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @ManyToOne(() => User)
  user: User;
}
