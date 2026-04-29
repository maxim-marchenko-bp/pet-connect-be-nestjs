import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { User } from '../user/user.entity';
import { Public } from '../../core/auth/decorators/public.decorator';
import { CookieInterceptor } from '../../core/auth/interceptors/cookie.interceptor';
import { SetCookie } from '../../core/auth/decorators/set-cookie.decorator';
import { GetCookie } from '../../core/auth/decorators/get-cookie.decorator';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Public()
  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() userDto: RegisterUserDto) {
    await this.authService.register(userDto);
    return { message: 'User successfully registered' };
  }

  @Public()
  @UseInterceptors(CookieInterceptor)
  @SetCookie('refreshToken')
  @Post('sign-in')
  async signIn(@Body() authCredentials: Pick<User, 'email' | 'password'>) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(authCredentials);
    return {
      accessToken,
      cookies: {
        refreshToken,
      },
    };
  }

  @Public()
  @UseInterceptors(CookieInterceptor)
  @SetCookie('refreshToken')
  @Post('refresh')
  async refresh(@GetCookie('refreshToken') refreshToken: string) {
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenService.refresh(refreshToken);
    return {
      accessToken,
      cookies: {
        refreshToken: newRefreshToken,
      },
    };
  }
}
