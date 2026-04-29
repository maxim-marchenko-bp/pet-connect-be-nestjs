import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { SecurityModule } from '../../core/auth/security/security.module';
import { JwtSharedModule } from '../../core/auth/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtSharedModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
