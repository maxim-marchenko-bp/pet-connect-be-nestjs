import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ListFilterModule } from '../../common/list-filter/list-filter.module';
import { SecurityModule } from '../../core/auth/security/security.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ListFilterModule, SecurityModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
