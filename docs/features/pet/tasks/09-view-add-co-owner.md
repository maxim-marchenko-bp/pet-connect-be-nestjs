---
id: T9
title: "Implement view co-owners and add co-owner (GET/POST /api/pets/:id/co-owners)"
layer: "app"
deps: ["T4"]
acs: ["AC-08", "AC-09", "AC-09b", "AC-09c", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T9 — Implement view co-owners and add co-owner (GET/POST /api/pets/:id/co-owners)

## Why

Derives from [spec US-06/US-07 / AC-08 / AC-09 / AC-09b / AC-09c / AC-12](../spec.md), [sad Flow 8 & Flow 9](../sad.md), [openapi.yaml `/api/pets/{id}/co-owners`](../contracts/openapi.yaml). Adding an existing Co-owner is idempotent, not an error (AC-09c) — per spec, no consent flow this iteration (§3 non-goal).

## What

- `PetService.listCoOwners(id)`: loads the pet, throws `NotFoundException` if absent (AC-12), returns `{data: toPublicCoOwner(...)[]}` — never a password/credential field (AC-08).
- `PetService.addCoOwner(id, dto: AddCoOwnerDto, callerId)`: calls `assertCoOwner(id, callerId)` (T4, AC-09/AC-12); resolves the target user via `UserService` (400 if it doesn't reference an existing user, per api-sync-report OQ-1); if already a member, no-op success (AC-09c); else extends membership and returns the updated co-owner list (AC-09b).
- `PetController @Get(':id/co-owners')`, `@Post(':id/co-owners')`.

## Definition of Done

- [ ] integration test: co-owner list response never includes a `password`/credential field (AC-08)
- [ ] integration test: non-Co-owner caller is denied 403, membership unchanged (AC-09)
- [ ] integration test: Co-owner adding a new user extends membership, returns the updated list (AC-09b)
- [ ] integration test: Co-owner adding an already-member user leaves membership unchanged, reports success (AC-09c)
- [ ] integration test: missing pet 404s before the authz check (AC-12)
- [ ] lint + vet clean
