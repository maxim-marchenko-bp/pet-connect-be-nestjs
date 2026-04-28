import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  register(user: CreateUserDto) {
    console.log(user);
    return user;
  }
}
