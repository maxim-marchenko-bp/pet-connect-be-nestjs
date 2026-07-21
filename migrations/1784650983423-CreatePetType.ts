import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetType1784650983423 implements MigrationInterface {
  name = 'CreatePetType1784650983423';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pet_type" (
          "id" SERIAL PRIMARY KEY,
          "code" VARCHAR NOT NULL,
          "label" VARCHAR NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "pet_type";`);
  }
}
