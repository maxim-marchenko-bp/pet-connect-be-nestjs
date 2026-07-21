-- The "pet" table, matching src/modules/pet/pet.entity.ts. type_id FK carries
-- ON DELETE CASCADE to match the existing @ManyToOne(() => PetType, { onDelete: 'CASCADE' })
-- (the resulting silent pet-loss-on-pet-type-delete risk is sad.md §11's open item,
-- routed to the pet-type context — not addressed by this migration).

CREATE TABLE IF NOT EXISTS "pet" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "date_of_birth" TIMESTAMP NOT NULL,
    "type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "FK_pet_type_id" FOREIGN KEY ("type_id") REFERENCES "pet_type"("id") ON DELETE CASCADE
);

-- data-model.md § Indexes: IDX_pet_type_id — FK-column index, serves the
-- pet-type existence check on every create/update (AC-03).
CREATE INDEX IF NOT EXISTS "IDX_pet_type_id" ON "pet" ("type_id");
