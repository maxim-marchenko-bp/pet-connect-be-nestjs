import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPets1784650983425 implements MigrationInterface {
  name = 'CreateUserPets1784650983425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_pets" (
          "user_id" INTEGER NOT NULL,
          "pet_id" INTEGER NOT NULL,
          CONSTRAINT "PK_user_pets" PRIMARY KEY ("user_id", "pet_id"),
          CONSTRAINT "FK_user_pets_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_user_pets_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_pets_pet_id" ON "user_pets" ("pet_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_pets_pet_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_pets";`);
  }
}
