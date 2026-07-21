---
id: T4
title: "Add the assertCoOwner authorization helper"
layer: "app"
deps: ["T3"]
acs: ["AC-06", "AC-07", "AC-09", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T4 — Add the assertCoOwner authorization helper

## Why

Per [ADR-0001](../adr/0001-inline-service-layer-membership-check.md), every write path must re-verify the caller is a Co-owner, and a write on a missing pet must return not-found — not disguised as a 403 ([spec §5 AC-12](../spec.md)). Centralizing this in one helper is the mitigation for the "forgotten check" risk in [sad §11](../sad.md).

## What

- `PetService.assertCoOwner(petId: number, callerId: number): Promise<Pet>` — loads the pet with its `users` (membership) relation, throws `NotFoundException` if absent, throws `ForbiddenException` if `callerId` is not in `pet.users`, otherwise returns the loaded pet (so the caller reuses it instead of reloading).

## Definition of Done

- [ ] unit test: missing pet → `NotFoundException`
- [ ] unit test: pet exists, caller not a member → `ForbiddenException`
- [ ] unit test: pet exists, caller is a member → resolves with the loaded pet
- [ ] lint + vet clean

## Notes

Every subsequent write task (T7, T8, T9, T10) calls this helper as its first step — do not duplicate the load-then-check logic in those tasks.
