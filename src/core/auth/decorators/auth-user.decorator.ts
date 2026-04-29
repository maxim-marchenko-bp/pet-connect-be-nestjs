import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '../types/jwt-user.type';

export const AuthUser = createParamDecorator(
  (data: keyof JwtUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const { user } = request;
    return data ? user[data] : user;
  },
);
