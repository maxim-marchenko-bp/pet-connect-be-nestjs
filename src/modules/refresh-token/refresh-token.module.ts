import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { UserModule } from '../user/user.module';
import { JwtSharedModule } from '../../core/auth/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UserModule,
    JwtSharedModule,
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
