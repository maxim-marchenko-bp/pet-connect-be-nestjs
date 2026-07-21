---
status: Draft
owner: "Maksym Marchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-07-21"
---

# API sync report — pet

Contract: [`openapi.yaml`](./openapi.yaml). Derived from `data-model.md` (entities/columns),
`sad.md` §6 (sequence `alt`-branches), `spec.md` §4/§5 (endpoints, acceptance criteria).
No async flows exist (sad.md §8: "Events — N/A, no event bus"), so no `events.md` is produced.

## Deviations from the skill's fixed defaults (confirmed with the user before generation)

| Default | This contract | Why |
|---|---|---|
| Cursor pagination (`?after/before/limit` → `{items, has_next, has_prev, next_cursor}`) | Offset (`?page/pageSize` → `{data, totalCount}`) | Matches the repo's `ListFilterService`, already used by `GET /api/users/list`, and named explicitly in sad.md §8 as the established pagination convention. Introducing cursor pagination for pets alone would be a new, inconsistent pattern in a brownfield "finish the module on the existing pattern" feature. |
| `/api/v1/...` URL versioning | `/api/...` (no version segment) | `main.ts` calls `setGlobalPrefix('api')` only; no versioned route exists anywhere in the app today. |
| Error envelope `{code, message, details?}` | `{message, statusCode, timestamp, path}` | Matches the actual global `DatabaseExceptionFilter` (`src/common/filters/database-exception.filter.ts`) — the only error shape the running app produces. No `code` field exists in this repo; inventing one here would document a response the app doesn't return. |

No ADR was raised for these — they're existing repo-wide conventions, not a new architectural
choice scoped to `pet`. If the team later wants the skill's defaults (cursor pagination, versioned
URLs, coded errors) that's a cross-cutting change belonging to its own ADR/feature, not this one.

## Section A — field-origins table

| schema_path | origin | confidence |
|---|---|---|
| Pet.id | data-model.md → pet.id (SERIAL PK) | high |
| Pet.name | data-model.md → pet.name (VARCHAR NOT NULL) | high |
| Pet.dateOfBirth | data-model.md → pet.date_of_birth (TIMESTAMP NOT NULL) | high |
| Pet.type | data-model.md → pet.type_id (FK → pet_type) | high |
| PetType.id / code / label | data-model.md → pet_type.id / code / label | high |
| PetCreate.name | data-model.md → pet.name; maxLength 255 inferred from TypeORM's unspecified-length `varchar` default (no explicit bound in data-model.md or spec.md) | medium |
| PetCreate.dateOfBirth | data-model.md → pet.date_of_birth; ≤ today constraint from spec.md AC-01/AC-02 | high |
| PetCreate.typeId | data-model.md → pet.type_id FK; existence check from spec.md AC-03 | high |
| PetPage.data / totalCount | derived from `ListFilterService`/`UserService.getFilteredUsersList` convention (offset pagination) | high |
| DeleteConfirmation.id | inferred — spec.md AC-07b only says "confirms the pet is removed", no response shape given | low |
| CoOwner.id / name | data-model.md → user.id / user.name; sad.md §8 "minimal identity is name + id" | high |
| CoOwner (email excluded) | spec.md §8 open question — default "name + id only, no email" | medium |
| AddCoOwner.userId | data-model.md → user_pets.user_id (FK → user); spec.md AC-09b | high |
| Error.message / statusCode / timestamp / path | existing schema — `src/common/filters/database-exception.filter.ts` response body (not a data-model column; the app's actual error shape) | high |

## Section B — drift findings (4-point checklist)

1. **Endpoint ↔ data-model** — ✓. Every operation reads/writes `pet`, `pet_type`, or `user_pets`
   (e.g. `POST /api/pets/{id}/co-owners` writes `user_pets`; `GET /api/pets/{id}` reads `pet` + `pet_type`).
2. **Error code ↔ repo error definition** — ✓ (adapted). This repo has no `code`-based error
   registry; `Error.statusCode` values are checked against the exception classes named in sad.md §2/§8
   (`NotFoundException` → 404, `ForbiddenException` → 403, `ConflictException` → 409, `ValidationPipe`/
   invalid-reference → 400) and against `DatabaseExceptionFilter`'s FK-violation → 400 mapping. All
   statuses in the contract trace to one of those.
3. **Validation ↔ constraint** — ✓ with one flag. `PetCreate.name.maxLength: 255` has no explicit
   source (data-model.md says only "within max length", no number) — recorded as `medium` confidence
   above; not a blocking core failure since it doesn't tighten below any real constraint, only picks a
   placeholder pending confirmation.
4. **OpenAPI ↔ sequence** — ✓ with one flag (see OQ-1 below): flow 9 (add co-owner) shows only the
   "target user exists → yes" branch, no `alt` for "target user does not exist," but the contract
   documents a `400` for that case since `user_pets.user_id` FK-references `user(id)` and a
   nonexistent target would hit `DatabaseExceptionFilter`'s FK mapping regardless.

No core point failed and only 1 flag was raised (below core-pause threshold of ≥3) — the contract was
written directly; the flag is recorded as an Open Question rather than pausing the run.

### Open Questions raised (Save-as-OQ — 4-state action)

- **OQ-1 — add-co-owner with a non-existent target user.** sad.md §6 flow 9 never draws an `alt`
  branch for "target user does not exist" (only the happy "yes" path is shown), and no spec.md AC
  covers it. The contract documents a `400` (inferred from the `user_pets.user_id` FK + the existing
  `DatabaseExceptionFilter` FK-violation mapping), marked `# unresolved` in `openapi.yaml`.
  **Owner: sequences** (sad.md needs the missing `alt` branch) **and specify** (spec.md needs an AC).
  **Due:** before `tasks <slug>`.

## Coverage cross-check (back-feed)

| spec.md §5 AC | Operation / response |
|---|---|
| AC-01 | `POST /api/pets` → 201 |
| AC-02 | `POST /api/pets` → 400, `PUT /api/pets/{id}` → 400 |
| AC-03 | `POST /api/pets` → 400, `PUT /api/pets/{id}` → 400 |
| AC-04 | `GET /api/pets/{id}` → 200 |
| AC-05 | `GET /api/pets/list` → 200 |
| AC-06 | `PUT /api/pets/{id}` → 403 |
| AC-06b | `PUT /api/pets/{id}` → 200 |
| AC-07 | `DELETE /api/pets/{id}` → 403 |
| AC-07b | `DELETE /api/pets/{id}` → 200 |
| AC-08 | `GET /api/pets/{id}/co-owners` → 200 |
| AC-09 | `POST /api/pets/{id}/co-owners` → 403 |
| AC-09b | `POST /api/pets/{id}/co-owners` → 200 |
| AC-09c | `POST /api/pets/{id}/co-owners` → 200 (idempotent) |
| AC-10 | `DELETE /api/pets/{id}/co-owners/{userId}` → 409 |
| AC-10b | `DELETE /api/pets/{id}/co-owners/{userId}` → 200 (concurrent, same route — pessimistic lock is a service-layer detail, not a contract-visible branch) |
| AC-11 | `DELETE /api/pets/{id}/co-owners/{userId}` → 200 |
| AC-11b | `DELETE /api/pets/{id}/co-owners/{userId}` → 404 |
| AC-11c | `DELETE /api/pets/{id}/co-owners/{userId}` → 200 (self-removal, same route) |
| AC-12 | 404 on every read/write route for a missing pet |

Every AC maps to ≥1 operation/response; every operation maps to a §4 user story. No orphan endpoint
and no uncovered AC.

## Checklist

- [x] OpenAPI 3.1, `BearerAuth` global (no public pet endpoints).
- [x] Every error response uses the repo's actual envelope (deviation documented above).
- [x] Every operation has a request/success example; error examples use placeholder data only.
- [x] All shared types via `$ref`.
- [x] `spectral lint` clean except the non-blocking `info-contact` info-level warning (no contact
      object defined — cosmetic, not added to the OAS check target).
- [x] Field-origins table complete; 1 open question raised (OQ-1), routed upstream per the shared
      4-state actions — not blocking, below the ≥3-flag pause threshold.
