import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

export const createTestApp = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
};

export const signToken = (app: INestApplication, userId: number): string =>
  app.get(JwtService).sign({ sub: userId });

export const truncateAll = async (app: INestApplication): Promise<void> => {
  const dataSource = app.get(DataSource);
  await dataSource.query(
    'TRUNCATE TABLE "user_pets", "pet", "pet_type", "user" RESTART IDENTITY CASCADE',
  );
};
