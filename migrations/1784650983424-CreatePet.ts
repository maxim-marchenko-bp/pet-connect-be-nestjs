import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePet1784650983424 implements MigrationInterface {
  name = 'CreatePet1784650983424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pet" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR NOT NULL,
          "date_of_birth" TIMESTAMP NOT NULL,
          "type_id" INTEGER NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "FK_pet_type_id" FOREIGN KEY ("type_id") REFERENCES "pet_type"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pet_type_id" ON "pet" ("type_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pet_type_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pet";`);
  }
}
