import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { UserListFilter } from './types/user-filter';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@AuthUser('sub') userId: number) {
    return this.userService.getCurrentPublicUserById(userId);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('list')
  async getUsersList(@Query() query: UserListFilter) {
    return this.userService.getFilteredUsersList(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }
}
