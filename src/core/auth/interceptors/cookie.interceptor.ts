import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { SET_COOKIE_KEY } from '../decorators/set-cookie.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse();

    const cookieName = this.reflector.get<string>(
      SET_COOKIE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        const cookies = data.cookies ?? {};

        if (cookieName && cookies[cookieName]) {
          const ttlDays = Number(
            this.configService.get<string>('COOKIE_TTL_DAYS'),
          );

          response.cookie(cookieName, cookies[cookieName], {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: ttlDays * 24 * 60 * 60 * 1000,
          });

          const { cookies: _, ...responseData } = data;
          return responseData;
        }

        return data;
      }),
    );
  }
}
