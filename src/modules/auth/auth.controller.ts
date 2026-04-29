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
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { AuthUser } from '../../core/auth/decorators/auth-user.decorator';
import { Cookie } from '../../core/auth/decorators/cookie.decorator';

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
  async refresh(@Cookie('refreshToken') refreshToken: string) {
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenService.refresh(refreshToken);
    return {
      accessToken,
      cookies: {
        refreshToken: newRefreshToken,
      },
    };
  }

  @UseInterceptors(CookieInterceptor)
  @SetCookie('refreshToken')
  @Post('sign-out')
  async signOut(@AuthUser('sub') userId: number) {
    const { accessToken, refreshToken } =
      await this.authService.signOut(userId);
    return {
      accessToken,
      cookies: {
        refreshToken,
      },
    };
  }
}
