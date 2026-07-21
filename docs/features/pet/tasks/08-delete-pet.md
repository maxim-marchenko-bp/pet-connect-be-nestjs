---
id: T8
title: "Implement delete pet (DELETE /api/pets/:id)"
layer: "app"
deps: ["T4"]
acs: ["AC-07", "AC-07b", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T8 — Implement delete pet (DELETE /api/pets/:id)

## Why

Derives from [spec US-05 / AC-07 / AC-07b / AC-12](../spec.md), [sad Flow 7](../sad.md), [openapi.yaml `DELETE /api/pets/{id}`](../contracts/openapi.yaml). Hard delete, no soft-delete/undo per [spec §3 non-goals](../spec.md).

## What

- `PetService.deletePet(id, callerId)`: calls `assertCoOwner(id, callerId)` (T4); hard-deletes the pet — `user_pets` rows clear via the `ON DELETE CASCADE` FK ([data-model.md](../data-model.md)); returns `{id}` confirmation.
- `PetController @Delete(':id')`, `@AuthUser('sub') callerId`.

## Definition of Done

- [ ] integration test: non-Co-owner is denied 403, pet remains (AC-07)
- [ ] integration test: Co-owner's delete removes the pet and its `user_pets` rows (AC-07b)
- [ ] integration test: missing pet 404s before the authz check (AC-12)
- [ ] lint + vet clean
