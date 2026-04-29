import { SetMetadata } from '@nestjs/common';

export const SET_COOKIE_KEY = 'set-cookie';

export const SetCookie = (cookie: string) =>
  SetMetadata(SET_COOKIE_KEY, cookie);
