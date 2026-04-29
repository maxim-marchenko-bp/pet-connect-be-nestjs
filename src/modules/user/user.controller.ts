import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../core/auth/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@User('sub') userId: number) {
    return this.userService.getCurrentPublicUser(userId);
  }
}
