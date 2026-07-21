---
id: T3
title: "Wire PetModule and register it in AppModule"
layer: "infra"
deps: ["T1"]
acs: []
files_hint: ["src/modules/pet/pet.module.ts", "src/app.module.ts"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T3 — Wire PetModule and register it in AppModule

## Why

The `Pet` entity exists but the module is unwired — nothing about pets can be created, read, or managed today ([spec §1](../spec.md)). Follows the `user` module pattern named in [sad §5](../sad.md).

## What

- `pet.module.ts`: `TypeOrmModule.forFeature([Pet])`, import `ListFilterModule`, `PetTypeModule` (exports `PetTypeService`), `UserModule` (exports `UserService`) — matching `user.module.ts`'s shape.
- Register `PetModule` in `src/app.module.ts`.
- Confirm `PetTypeModule` and `UserModule` already export their services for injection (check, don't assume).

## Definition of Done

- [ ] `nest build` / app boot succeeds with `PetModule` registered and no circular-dependency error
- [ ] lint + vet clean

## Notes

Depends on T1 only because the module's repository injection targets the promoted schema; the module file itself doesn't touch SQL.
