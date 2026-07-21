---
id: T5
title: "Implement create pet (POST /api/pets)"
layer: "app"
deps: ["T2", "T3"]
acs: ["AC-01", "AC-02", "AC-03"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T5 — Implement create pet (POST /api/pets)

## Why

Derives from [spec US-01 / AC-01 / AC-02 / AC-03](../spec.md), [sad Flow 1 & Flow 3](../sad.md), [openapi.yaml `POST /api/pets`](../contracts/openapi.yaml).

## What

- `PetService.createPet(dto: CreatePetDto, callerId: number)`: validates the pet type exists via `PetTypeService` (AC-03), persists the pet, adds `callerId` to `user_pets` as the first Co-owner, returns `toPublicPet(...)` (no co-owner list).
- `PetController @Post()` on `/api/pets`, `@AuthUser('sub') callerId`, `@Body() CreatePetDto` — global `ValidationPipe` handles AC-02 field validation before the handler runs.

## Definition of Done

- [ ] integration test: valid input persists the pet, adds the creator as first Co-owner, returns the pet without a co-owner list (AC-01)
- [ ] integration test: empty/whitespace name, over-length name, or future date of birth is rejected 400 with the invalid field named, no row written (AC-02)
- [ ] integration test: an unknown `typeId` is rejected 400, no row written (AC-03)
- [ ] lint + vet clean
