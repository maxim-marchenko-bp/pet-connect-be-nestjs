import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from '../../shared/utils/hash-password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(userDto: CreateUserDto) {
    const hashedPassword = await hashPassword(userDto.password);
    const user = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }
}
