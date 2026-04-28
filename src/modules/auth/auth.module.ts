import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { SecurityModule } from '../../shared/security/security.module';
import { JwtSharedModule } from '../../shared/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtSharedModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
