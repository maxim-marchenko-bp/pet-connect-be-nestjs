import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() userDto: CreateUserDto) {
    try {
      await this.authService.register(userDto);
      return 'OK';
    } catch (error) {
      console.log('IN ERROR');
      throw new Error(error.message);
    }
  }
}
