---
id: T7
title: "Implement update pet — full replace (PUT /api/pets/:id)"
layer: "app"
deps: ["T4", "T5"]
acs: ["AC-03", "AC-06", "AC-06b", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T7 — Implement update pet — full replace (PUT /api/pets/:id)

## Why

Derives from [spec US-04 / AC-06 / AC-06b / AC-03 / AC-12](../spec.md), [sad Flow 6](../sad.md), [openapi.yaml `PUT /api/pets/{id}`](../contracts/openapi.yaml). Ordering (not-found → authz → pet-type validation) follows [ADR-0001](../adr/0001-inline-service-layer-membership-check.md).

## What

- `PetService.updatePet(id, dto: UpdatePetDto, callerId)`: calls `assertCoOwner(id, callerId)` (T4) — not-found before forbidden (AC-12, AC-06); validates the referenced pet type exists (AC-03); persists the full replacement; returns `toPublicPet(...)` (AC-06b, no co-owner list).
- `PetController @Put(':id')`, `@AuthUser('sub') callerId`, `@Body() UpdatePetDto`.

## Definition of Done

- [ ] integration test: non-Co-owner is denied 403, pet unchanged (AC-06)
- [ ] integration test: Co-owner's valid full replacement persists and returns without a co-owner list (AC-06b)
- [ ] integration test: unknown `typeId` is rejected 400 (AC-03)
- [ ] integration test: missing pet 404s before the authz check (AC-12)
- [ ] lint + vet clean
