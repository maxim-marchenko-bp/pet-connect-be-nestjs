import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../../modules/user/user.entity';
import { Pet } from '../../modules/pet/pet.entity';
import { PetType } from '../../modules/pet-type/pet-type.entity';
import { RefreshToken } from '../../modules/refresh-token/refresh-token.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Pet, PetType, RefreshToken],
  migrations: ['migrations/*.ts'],
  synchronize: false,
});
