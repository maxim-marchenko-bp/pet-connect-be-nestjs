import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { PasswordHasher } from '../../shared/security/password-hasher.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: userDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.passwordHasher.hashPassword(
      userDto.password,
    );
    const user = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async signIn(authCredentials: Pick<User, 'email' | 'password'>) {
    const user = await this.userRepository.findOneBy({
      email: authCredentials.email,
    });
    if (!user) {
      throw new UnauthorizedException('Something went wrong');
    }

    const isPasswordOk = await this.passwordHasher.comparePassword(
      authCredentials.password,
      user.password,
    );

    if (!isPasswordOk) {
      throw new UnauthorizedException('Something went wrong');
    }

    const token = this.jwtService.sign({ userId: user.id });

    return { token };
  }
}
