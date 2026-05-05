import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { PasswordHasherService } from '../../core/auth/security/password-hasher.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasherService,
    private readonly refreshTokenService: RefreshTokenService,
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
      throw new UnauthorizedException('Unauthorized');
    }

    const isPasswordOk = await this.passwordHasher.comparePassword(
      authCredentials.password,
      user.password,
    );

    if (!isPasswordOk) {
      throw new UnauthorizedException('Unauthorized');
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken = this.refreshTokenService.generateRefreshToken();
    await this.refreshTokenService.save(refreshToken, user.id);

    return { accessToken, refreshToken };
  }

  async signOut(userId: number) {
    await this.refreshTokenService.deleteTokenByUserId(userId);
    return { accessToken: '', refreshToken: '' };
  }
}
