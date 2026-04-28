import { Controller, Get, Headers } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@Headers('Authorization') authToken: string) {
    return this.userService.getCurrentUser(authToken);
  }
}
