import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/user/user.entity';
import { Pet } from '../../modules/pet/pet.entity';
import { PetType } from '../../modules/pet-type/pet-type.entity';
import { RefreshToken } from '../../modules/refresh-token/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Pet, PetType, RefreshToken],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
