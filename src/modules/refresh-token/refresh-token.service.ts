import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  save(refreshToken: string, userId: number) {
    const refreshTokenTtl = this.configService.get<string>(
      'REFRESH_TOKEN_TTL_DAYS',
    );
    return this.refreshTokenRepository.save({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + Number(refreshTokenTtl) * 24 * 60 * 60 * 1000,
      ),
    });
  }

  async refresh(refreshToken: string) {
    const refreshTokenData = await this.refreshTokenRepository.findOne({
      where: { tokenHash: this.hashToken(refreshToken) },
    });

    if (!refreshTokenData) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isTokenExpired = refreshTokenData.expiresAt < new Date();

    if (isTokenExpired) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.userService.getCurrentPublicUserById(
      refreshTokenData.userId,
    );

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const newAccessToken = this.jwtService.sign({ sub: user.id });
    const newRefreshToken = this.generateRefreshToken();
    await this.save(newRefreshToken, user.id);
    await this.deleteTokenById(refreshTokenData.id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  deleteTokenById(id: number) {
    return this.refreshTokenRepository.delete({ id });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
