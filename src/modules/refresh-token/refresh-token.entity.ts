import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class RefreshToken extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;
}
