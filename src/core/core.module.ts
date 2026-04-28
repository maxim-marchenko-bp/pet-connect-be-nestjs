import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/user/user.entity';
import { Pet } from '../modules/pet/pet.entity';
import { PetType } from '../modules/pet-type.entity';
import { RefreshToken } from '../modules/refresh-token/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Pet, PetType, RefreshToken],
      synchronize: true,
    }),
  ],
})
export class CoreModule {}
