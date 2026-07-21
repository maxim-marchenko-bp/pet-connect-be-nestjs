-- The "user_pets" join table — the pet's Membership (spec §1/§4). Matches the
-- existing @JoinTable({ name: 'user_pets', joinColumn: { name: 'user_id' },
-- inverseJoinColumn: { name: 'pet_id' } }) on User.pets. Composite PK enforces
-- idempotent add-co-owner (AC-09c); ON DELETE CASCADE on both FKs clears
-- membership when a pet or a user is removed (AC-07b).

CREATE TABLE IF NOT EXISTS "user_pets" (
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER NOT NULL,
    CONSTRAINT "PK_user_pets" PRIMARY KEY ("user_id", "pet_id"),
    CONSTRAINT "FK_user_pets_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_user_pets_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE CASCADE
);

-- data-model.md § Indexes: IDX_user_pets_pet_id — the composite PK leads with
-- user_id, so a pet-id-only lookup (assertCoOwner, ADR-0001; view co-owners
-- AC-08; add/remove co-owner AC-09/10/11) needs its own index.
CREATE INDEX IF NOT EXISTS "IDX_user_pets_pet_id" ON "user_pets" ("pet_id");
