import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { User } from '../user/user.entity';
import { Public } from '../../core/auth/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() userDto: RegisterUserDto) {
    await this.authService.register(userDto);
    return { message: 'User successfully registered' };
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() authCredentials: Pick<User, 'email' | 'password'>) {
    return await this.authService.signIn(authCredentials);
  }
}
