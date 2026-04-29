import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { toPublicUser } from '../../shared/utils/to-public-user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getCurrentPublicUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return toPublicUser(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
