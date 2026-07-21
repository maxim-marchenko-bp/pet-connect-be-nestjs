-- Bootstrap: the "refresh_token" table, as currently produced by TypeORM
-- synchronize:true from src/modules/refresh-token/refresh-token.entity.ts.
-- user_id carries NO FK constraint here, matching the current entity — a known
-- looseness recorded in architecture-map.md ("known tech-debt"), not fixed by
-- this migration.

CREATE TABLE IF NOT EXISTS "refresh_token" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- data-model.md § Indexes: exact-match lookup on every refresh (RefreshTokenService.refresh).
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_refresh_token_token_hash" ON "refresh_token" ("token_hash");
-- data-model.md § Indexes: RefreshTokenService.deleteTokenByUserId on sign-out/rotation.
CREATE INDEX IF NOT EXISTS "IDX_refresh_token_user_id" ON "refresh_token" ("user_id");
