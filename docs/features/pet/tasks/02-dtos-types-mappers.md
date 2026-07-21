---
id: T2
title: "Add pet DTOs, public types, and mappers"
layer: "domain"
deps: []
acs: ["AC-01", "AC-02", "AC-04", "AC-05", "AC-06b", "AC-08"]
files_hint: ["src/modules/pet/dto/", "src/modules/pet/types/", "src/modules/pet/mappers/"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T2 — Add pet DTOs, public types, and mappers

## Why

Validation and serialization rules are pure domain concerns independent of wiring — derives from [spec §5 AC-01/AC-02/AC-06b](../spec.md) (name/date-of-birth validation) and [sad §8](../sad.md) (`to-public-pet` mirrors `to-public-user`, never emits credentials). Matches [openapi.yaml](../contracts/openapi.yaml) schemas `PetCreate`/`Pet`/`CoOwner`.

## What

- `dto/create-pet.dto.ts`, `dto/update-pet.dto.ts` (full-replace, same shape as create per AC-06b) — `class-validator` decorators: name trimmed non-empty within max length (255), `dateOfBirth` ≤ today server UTC, `typeId` required integer.
- `dto/add-co-owner.dto.ts` — `userId: number` required.
- `types/pet-filter.ts` (mirrors `user/types/user-filter.ts` for `ListFilterService`), `types/pet-public.type.ts`, `types/co-owner-public.type.ts`.
- `mappers/to-public-pet.ts`, `mappers/to-public-co-owner.ts` — project entities to the public shape; co-owner mapper emits `{id, name}` only (no email, per spec §8 open question default), never `password`.

## Definition of Done

- [ ] unit tests: `CreatePetDto`/`UpdatePetDto` reject empty/whitespace-only name, name over max length, and a future date of birth
- [ ] unit tests: `toPublicPet`/`toPublicCoOwner` never include a `password` field, matching `to-public-user`'s pattern
- [ ] lint + vet clean

## Notes

No DB or module wiring here — pure DTOs/types/mappers, safe to build before T1/T3 land.
