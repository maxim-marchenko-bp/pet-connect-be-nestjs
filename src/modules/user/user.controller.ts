import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@AuthUser('sub') userId: number) {
    return this.userService.getCurrentPublicUserById(userId);
  }
}
