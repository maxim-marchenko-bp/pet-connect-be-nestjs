import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshToken1784650983426 implements MigrationInterface {
  name = 'CreateRefreshToken1784650983426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_token" (
          "id" SERIAL PRIMARY KEY,
          "user_id" INTEGER NOT NULL,
          "token_hash" VARCHAR NOT NULL,
          "expires_at" TIMESTAMP NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_refresh_token_token_hash" ON "refresh_token" ("token_hash");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_refresh_token_user_id" ON "refresh_token" ("user_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_token_user_id";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_token_token_hash";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_token";`);
  }
}
