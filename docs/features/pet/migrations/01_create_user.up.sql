-- Bootstrap: the "user" table, as currently produced by TypeORM synchronize:true
-- from src/modules/user/user.entity.ts. Staged by data-model (pet) per sad.md §11
-- accepted debt ("no migrations" — this stage owns closing that gap).

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
