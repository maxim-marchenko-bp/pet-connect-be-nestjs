import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1784650983422 implements MigrationInterface {
  name = 'CreateUser1784650983422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
          "id" SERIAL PRIMARY KEY,
          "email" VARCHAR NOT NULL,
          "name" VARCHAR NOT NULL,
          "lastname" VARCHAR,
          "password" VARCHAR NOT NULL,
          "date_of_birth" TIMESTAMP,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_user_email" UNIQUE ("email")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user";`);
  }
}
