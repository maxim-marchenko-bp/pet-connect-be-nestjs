import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { UserListFilter } from './types/user-filter';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseExceptionFilter } from '../../common/filters/database-exception.filter';
import { Public } from '../../core/auth/decorators/public.decorator';

@Public()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@AuthUser('sub') userId: number) {
    return this.userService.getCurrentPublicUserById(userId);
  }

  @Get('list')
  async getUsersList(@Query() query: UserListFilter) {
    return this.userService.getFilteredUsersList(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @UseFilters(DatabaseExceptionFilter)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
