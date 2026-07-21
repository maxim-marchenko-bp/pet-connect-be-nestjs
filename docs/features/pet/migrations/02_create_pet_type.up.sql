-- Bootstrap: the "pet_type" table, as currently produced by TypeORM synchronize:true
-- from src/modules/pet-type/pet-type.entity.ts.

CREATE TABLE IF NOT EXISTS "pet_type" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
