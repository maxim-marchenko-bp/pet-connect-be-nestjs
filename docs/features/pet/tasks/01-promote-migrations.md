---
id: T1
title: "Promote staged migrations to the live tree and disable synchronize"
layer: "migration"
deps: []
acs: []
files_hint: ["docs/features/pet/migrations/", "migrations/", "src/core/database/database.module.ts", "src/core/database/data-source.ts"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T1 — Promote staged migrations to the live tree and disable synchronize

## Why

The schema exists today only via TypeORM `synchronize: true` — a repo-wide gap `data-model` staged five migration files (`user`, `pet_type`, `pet`, `user_pets`, `refresh_token`) but did not promote them, per [data-model.md](../data-model.md) and its [audit report](../_audit/data-model-2026-07-21.md). Every other task in this feature persists through these tables, so this is the prerequisite.

## What

- Convert the five staged SQL pairs under `docs/features/pet/migrations/` into timestamp-prefixed TypeORM migration classes (`up`/`down` executing the staged SQL via `queryRunner.query(...)`) in the live `migrations/` tree, timestamps ascending 01→05 to preserve FK order.
- Add a CLI-invocable `DataSource` export (`src/core/database/data-source.ts`) and point `database.module.ts` at the `migrations` array (or `migrationsRun: true`).
- Set `synchronize: false` in `src/core/database/database.module.ts:14` — per the audit's mandatory follow-up, leaving it on risks TypeORM's sync engine dropping the undecorated indexes (`IDX_pet_type_id`, `IDX_user_pets_pet_id`, `IDX_refresh_token_token_hash`, `IDX_refresh_token_user_id`) these migrations create.

## Definition of Done

- [ ] `typeorm migration:run` applies all five migrations cleanly against an empty database
- [ ] `typeorm migration:revert` reverts them cleanly in reverse order
- [ ] `synchronize: false` is set; the app still boots against the migrated schema
- [ ] lint + vet clean

## Notes

Ordinal order (01→05) encodes FK dependency order (parents before children) — do not reorder. This is the first migration set ever promoted in this repo, so there is no existing sequence to collide with.
