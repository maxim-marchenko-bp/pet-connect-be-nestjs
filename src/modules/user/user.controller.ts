import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { Public } from '../../core/auth/decorators/public.decorator';
import { UserFilter } from './types/user-filter';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@AuthUser('sub') userId: number) {
    return this.userService.getCurrentPublicUserById(userId);
  }

  @Public()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('list')
  async getUsersList(@Query() query: UserFilter) {
    return this.userService.getFilteredUsersList(query);
  }
}
