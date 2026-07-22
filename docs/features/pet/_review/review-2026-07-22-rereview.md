# Review record — pet — 2026-07-22 (re-review)

- **Feature:** pet (size S, quick route)
- **Reviewer:** independent clean-context `sdd:reviewer` subagent (did not author the code)
- **Verdict:** **PASS**
- **Supersedes:** the same-day `CHANGES REQUESTED` record (`review-2026-07-22.md`), whose four findings are all resolved here.

## Scope

Whole-feature diff `845d283..HEAD` (base = last SDD-artifact commit before implementation).

```
44 files changed, 1694 insertions(+), 45 deletions(-)
```

Surfaces reviewed: `src/modules/pet/**`, shared `src/shared/types/generic-filter.ts` + `src/common/list-filter/services/list-filter.service.ts`, `test/pet-*.e2e-spec.ts` + `test/support/**`, `migrations/**`, `src/core/database/**`, `src/app.module.ts`. Declared `target_surfaces: [backend-service]` — matched; no stray surfaces.

## Fix verification (prior findings F1–F4)

- **F1 — AC-05 max page size — RESOLVED.** Real enforcement is the service-layer clamp `pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, ...))` (`src/common/list-filter/services/list-filter.service.ts:34-37`), with `take: pageSize`. Covered by a new unit test asserting `pageSize=100000` clamps to ≤100 (`src/common/list-filter/services/list-filter.service.spec.ts:11-20`). No `user`-module regression: `PetListFilter`/`UserListFilter` are both `type … & GenericFilter`, so the clamp applies identically to both list endpoints. (Commit `1de9416`.)
- **F2 — dead `UserService` — RESOLVED.** Injection removed from the service constructor and `pet.module.ts`; `addCoOwner` relies on the `user_pets` FK backstop, explicit target-user check deferred per OQ-1. (Commit `0fda05f`.)
- **F3 — red aggregate e2e — RESOLVED.** Stale `test/app.e2e-spec.ts` deleted; `npm run test:e2e` now runs the 9 pet suites, all green. (Commit `120b4ca`.)
- **F4 — contract vs response shape — RESOLVED.** `openapi.yaml` now declares `createdAt`/`updatedAt` on `PetType` and `Pet`, matching what `to-public-pet` returns (strips only `users`). Consistent with the `to-public-user` convention. (Commit `7163cf8`.)

## Traceability result

Full end-to-end re-trace (spec §4/§5 → sad §6 flows → data-model → openapi → tasks → code+test) passed for **all 19 acceptance criteria** (AC-01, 02, 03, 04, 05, 06, 06b, 07, 07b, 08, 09, 09b, 09c, 10, 10b, 11, 11b, 11c, 12) and **all 8 user stories** (US-01..US-08 → ≥1 AC + ≥1 §6 flow). Nothing dropped out of the chain. AC-05 (the prior gap) is genuinely closed. Privacy (QG-3) holds — `to-public-co-owner` emits only `{id, name}`; no path emits `password`/`email`. Concurrency (QG-2 / AC-10b) exercised by a green concurrent-removal e2e over the pessimistic-lock transaction (`pet.service.ts:150-187`).

Fresh runs: **13/13 unit + 39/39 e2e pass.**

## Findings

### F5 — [stage-2] `GenericFilter` `@Max`/`@Min` decorators are inert — **Not an issue (dismissed)**

- **Where:** `src/shared/types/generic-filter.ts:5-14`.
- **Touches:** AC-05.
- **Observation:** the list endpoints type `@Query()` as type-alias intersections (`PetListFilter`/`UserListFilter`), not classes, so NestJS `ValidationPipe` never runs class-validator against them; the `@Max(100)`/`@Min(1)` guards do not fire at the DTO layer. AC-05's bound is enforced **solely** by the tested service-layer clamp.
- **Verdict:** PLAUSIBLE / informational — not a defect. The clamp fully and correctly satisfies AC-05 and is covered by a unit test.
- **Resolution:** Dismissed by the review owner. The clamp is the real, tested guard; the decorators are harmless. Worth a one-line note only if a class-based query DTO is ever introduced.

## Gate result

**PASS.** No stage-1 AC gap; all four prior findings resolved and verified; the single new observation (F5) dismissed with reason. No open stage-1 finding remains. Ready to ship.
