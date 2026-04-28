import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(user: any) {
    console.log(user);
    return user;
  }
}
