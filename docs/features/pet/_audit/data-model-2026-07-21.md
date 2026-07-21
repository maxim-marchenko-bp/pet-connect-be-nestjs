---
status: Draft
owner: "Maksym Marchenko"
updated_at: "2026-07-21"
---

# Data-model audit — pet — 2026-07-21

## Convention source

- `docs/architecture-map.md` §Migrations: **`migration_tool: ""`** — none in use; `synchronize: true`
  auto-syncs schema, no `migrations/` tree exists.
- `sad.md` §2 constraints: PostgreSQL via TypeORM `Repository<T>`, `synchronize: true`, no migrations.
- `sad.md` §11 accepted debt: *"No migrations — the Pet table + pet↔user join table are created by
  TypeORM `synchronize: true`... This is a repo-wide gap the `data-model` stage owns, not a
  pet-specific choice."*
- No prior architecture signal existed for **which** migration tool to adopt (greenfield gap for this
  one topic only) → confirmed with the user via `AskUserQuestion`:
  - Tool: **TypeORM migrations** (native to the stack already in use — `@nestjs/typeorm` 11 +
    `typeorm` 0.3.28).
  - Scope: **bootstrap the full current schema** (`user`, `pet_type`, `pet`, `user_pets`,
    `refresh_token`), not just pet-scoped tables — because `pet`/`user_pets` FK-reference `user` and
    `pet_type`, a pets-only migration set can't stand alone.
- Everything else (naming, PK strategy, audit columns, delete strategy, string types) was **derived**
  from the existing entities (`pet.entity.ts`, `user.entity.ts`, `pet-type.entity.ts`,
  `refresh-token.entity.ts`, `base.entity.ts`) and TypeORM's `DefaultNamingStrategy` (verified in
  `node_modules/typeorm/naming-strategy/DefaultNamingStrategy.js` — table/column names snake_case the
  entity class name unless a decorator overrides it) — not confirmed with the user, since the repo
  already has a clear, consistent convention.

## Staged migrations

All staged under `docs/features/pet/migrations/`, feature-local ordinal names, **not** in the live
`migrations/` tree:

| # | File | Table | FK deps |
|---|---|---|---|
| 01 | `01_create_user.up.sql` / `.down.sql` | `user` | none |
| 02 | `02_create_pet_type.up.sql` / `.down.sql` | `pet_type` | none |
| 03 | `03_create_pet.up.sql` / `.down.sql` | `pet` | → `pet_type(id)` |
| 04 | `04_create_user_pets.up.sql` / `.down.sql` | `user_pets` | → `user(id)`, `pet(id)` |
| 05 | `05_create_refresh_token.up.sql` / `.down.sql` | `refresh_token` | none (see note) |

Ordinal order encodes FK dependency order (parents before children); safe to apply in sequence.

## Promote-time hint

The repo has **no existing migration files** — `implement` (or whichever stage first promotes) is the
**first** to populate the live `migrations/` tree. Per the user's confirmed tool choice:

- Promotion should create the standard TypeORM CLI structure — a `migrations/` directory of
  timestamp-prefixed `*.ts` files (e.g. `1721520000000-CreateUser.ts`), each with `up(queryRunner)` /
  `down(queryRunner)` methods that execute the staged SQL via `queryRunner.query(...)`. Timestamps
  must be assigned in ascending order matching the 01→05 ordinal sequence above.
- `database.module.ts` needs a `migrations: [...]` array (or `migrationsRun: true` autorun) added to
  the `TypeOrmModule.forRootAsync` config, and a CLI-invocable `DataSource` export for
  `typeorm migration:run` (currently only the NestJS-managed connection exists — no standalone
  `DataSource` for the CLI).
- Since this is the first migration set ever staged, there is no "next sequence number" to collide
  with — this establishes the sequence.

## ⚠️ Mandatory follow-up: `synchronize: true` must be turned off at promotion

`src/core/database/database.module.ts:14` sets `synchronize: true`. If this stays on after the
migrations are promoted, TypeORM's schema-sync engine will keep reconciling the live schema against
entity **metadata** on every boot — and it does not know about:
- `IDX_pet_type_id`, `IDX_user_pets_pet_id` (FK-column indexes with no `@Index` decorator in code)
- `IDX_refresh_token_token_hash` (unique), `IDX_refresh_token_user_id` (no `@Index` decorator)

TypeORM's synchronize reconciliation can drop indexes/constraints it doesn't recognize from decorated
metadata. **Promoting these migrations without also setting `synchronize: false` risks the sync engine
undoing them on the next boot.** This is not optional cleanup — it is required for the migrations to be
meaningful at all. Flagging it here since `data-model` stages SQL but does not touch application wiring
(`layer: migration` vs `layer: code` — `implement`'s job).

## Convention deviations

None. Every column/type/constraint mirrors the live entity decorators exactly (verified column-by-column
against `pet.entity.ts`, `user.entity.ts`, `pet-type.entity.ts`, `refresh-token.entity.ts`,
`base.entity.ts`). The three added indexes (`IDX_pet_type_id`, `IDX_user_pets_pet_id`,
`IDX_refresh_token_token_hash`, `IDX_refresh_token_user_id`) are **additive** — real queries in the
existing `RefreshTokenService` and the sequence-diagram flows justify each one; none is "just in case."

## Drift findings

None. This is a from-scratch bootstrap derived directly from the current entity source, not a diff
against a pre-existing migration history — there is nothing to drift from yet. Once these are promoted,
future `data-model --drift-only` runs have a real baseline to check against.

## Breaking-change decompositions

N/A — every table is a fresh `CREATE TABLE`, not an alter on an existing live table (no expand →
backfill → contract needed).

## `<!-- TBD -->` items

None left open in `data-model.md`. Two items are explicitly out of scope per the SAD/spec, not TBD:
- `pet_type.code` uniqueness — not enforced (repo doesn't declare it); the CASCADE-delete risk on
  `pet.type_id` is `sad.md` §11's separate open item, routed to the pet-type context.
- `refresh_token.user_id` FK constraint — intentionally omitted, matching the current entity (known
  looseness, `architecture-map.md`).

## Self-check results (step 12)

| Check | Result |
|---|---|
| Naming matches repo convention | ✅ snake_case tables/columns, verified against `DefaultNamingStrategy` |
| Down reversibility | ✅ every `CREATE TABLE`/`CREATE INDEX` has a matching `DROP` in the paired `.down.sql` |
| FK indexes | ✅ `pet.type_id`, `user_pets.pet_id` indexed; `user_pets.user_id` covered by the composite PK's leading position; `refresh_token.user_id` has no FK (matches entity) but is indexed for its real query |
| Convention adherence | ✅ no deviation from the repo's PK/audit-column/type/constraint style |

## Test fixtures

Documented in `data-model.md` § Test fixtures as a placeholder (no fixture-factory pattern exists yet
in the repo — `architecture-map.md` notes zero unit tests today). `plan-tests`/`implement` establish the
actual factory code.

## Next stage

`/sdd:api pet`
