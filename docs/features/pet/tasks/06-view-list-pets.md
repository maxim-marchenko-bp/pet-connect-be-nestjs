---
id: T6
title: "Implement view pet and browse pets (GET /api/pets/:id, GET /api/pets/list)"
layer: "app"
deps: ["T2", "T3"]
acs: ["AC-04", "AC-05", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T6 — Implement view pet and browse pets (GET /api/pets/:id, GET /api/pets/list)

## Why

Derives from [spec US-02/US-03 / AC-04 / AC-05 / AC-12](../spec.md), [sad Flow 4 & Flow 5](../sad.md), reusing `ListFilterService` per [sad §8 Pagination](../sad.md) and [openapi.yaml `GET /api/pets/{id}`, `GET /api/pets/list`](../contracts/openapi.yaml).

## What

- `PetService.getPetById(id)`: loads the pet with its `type` relation, throws `NotFoundException` if absent (AC-12), returns `toPublicPet(...)` (no co-owner list, AC-04).
- `PetService.getFilteredPetsList(filters: PetListFilter)`: mirrors `UserService.getFilteredUsersList` — `ListFilterService` for bounded pages, stable default order by `id`, returns `{data, totalCount}`.
- `PetController @Get(':id')`, `@Get('list')` (route order matters — register `list` before `:id` if colliding, matching the `user` controller's pattern).

## Definition of Done

- [ ] integration test: `GET /api/pets/:id` returns name/dateOfBirth/type without a co-owner list (AC-04)
- [ ] integration test: `GET /api/pets/:id` 404s for a non-existent pet (AC-12)
- [ ] integration test: `GET /api/pets/list` returns a bounded page with `totalCount`, stable default ordering, respects `page`/`pageSize` (AC-05)
- [ ] lint + vet clean
