---
status: Draft
owner: "Maksym Marchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-07-21"
feature_size: "S"
---

# Spec — pet

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** `docs/architecture-map.md`; the existing `src/modules/pet/pet.entity.ts`, `src/modules/user/*`, `src/modules/pet-type/*` (the `user` module is the reference pattern for a relation-bearing CRUD module); `TODO.md` (the Pet endpoint checklist). No external docs/tickets.

## 1. Context

The `pet` module is half-built: the `Pet` entity exists (name, date of birth, a pet-type reference, and a many-to-many link to users) but has no controller, service, or wiring, so nothing about pets can be created, read, or managed today. Pet-connect is a shared-pet-management API — a household or a couple co-owns a pet — and every downstream flow (pet invites, per-pet activity) depends on pets and their co-ownership existing first. This feature is for the **Authenticated user** who needs to register a pet and share it with the people who care for it.

Why now: pets are the spine of the product and the entity was scaffolded but never finished (`TODO.md` lists all seven Pet operations as unbuilt); the pet-invite and assign-pet features already sketched in `TODO.md` cannot be built until pets and their **Membership** are manageable.

The committed approach: finish the module as a relation-bearing CRUD following the existing `user` module pattern — pets are **read-all** (any Authenticated user may view or list any pet) but **write-members** (only a **Co-owner** may edit, delete, or change a pet's membership). The creator becomes the first Co-owner automatically; membership is managed inline (add/remove Co-owners) but can never be emptied (the no-orphan invariant); a pet must reference an existing **Pet type**; deletion is a hard delete performed by any Co-owner.

Traceability / risk context — surfaced in the ideation failure-mode pass and carried into §3, §5, §6.1 and §8:
- Read-all over sequential ids lets any Authenticated user enumerate every pet and its co-owner identities → the co-owner list must never expose credentials, and email exposure is an open question (§8).
- The global auth guard only authenticates; the write-members rule is a per-operation check with no framework backstop → each write path must re-verify membership (§5 AC-06/AC-09, §6.1).
- The pet-type reference is a database CASCADE today, so deleting a pet type would silently destroy pets → flagged as an open question for the pet-type context (§8), not solved here.

## 2. Goals

- Every Pet lifecycle operation (create, view, list, update, delete) is available to Authenticated users, with membership enforced on all writes.
- A Co-owner can manage a pet's Membership (add/remove Co-owners) without ever leaving the pet ownerless.
- Every write validates its inputs and its cross-context Pet-type reference before persisting, and no pet response ever exposes user credentials.

## 3. Non-goals

- **No invite/consent flow for adding a Co-owner** — a Co-owner is added directly by userId; the invite/join/assign flows in `TODO.md` are separate future features. (Reason: keep this feature to finishing pet CRUD + basic membership.)
- **No soft delete, undo, or deletion audit trail** — deletion is a hard delete this iteration. (Reason: matches the existing hard-delete pattern; history/undo is a later concern.)
- **No restriction of pet visibility** — read-all is intentional; per-pet read privacy is out of scope. (Reason: product is collaborative and visibility scoping is a larger design.)
- **No management of Pet types themselves** — creating/editing pet types belongs to the pet-type feature. (Reason: separate bounded context.)

## 4. User stories

### US-01: Register a pet

**As an** Authenticated user
**I want** to create a pet with a name, date of birth, and pet type
**So that** it exists in the system and I become its first Co-owner

### US-02: View a pet

**As an** Authenticated user
**I want** to view a pet's details
**So that** I can see its name, date of birth, and pet type

### US-03: Browse pets

**As an** Authenticated user
**I want** to list pets
**So that** I can find a pet to view or manage

### US-04: Update a pet

**As a** Co-owner
**I want** to change a pet I co-own
**So that** its details stay correct

### US-05: Remove a pet

**As a** Co-owner
**I want** to delete a pet I co-own
**So that** records for a pet that no longer applies are removed

### US-06: See a pet's co-owners

**As an** Authenticated user
**I want** to see which users co-own a pet
**So that** I know who is responsible for it

### US-07: Add a co-owner

**As a** Co-owner
**I want** to add another user as a Co-owner of a pet I co-own
**So that** we can share responsibility for it

### US-08: Remove a co-owner

**As a** Co-owner
**I want** to remove a Co-owner from a pet I co-own
**So that** membership reflects who actually cares for the pet

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** an Authenticated user supplying a name that is non-empty after trimming and within the maximum length, a date of birth no later than today (equality allowed; "later than today" is evaluated against the server's UTC date), and an existing pet type
**When** the user creates the pet
**Then** the system records the pet, adds the creating user as its first Co-owner, and confirms the created pet — its name, date of birth, and pet type — back to the user, without embedding the co-owner list

### AC-02 (US-01) — error (invalid input)

**Given** an Authenticated user whose new-pet details have a name that is empty or whitespace-only after trimming, a name that exceeds the maximum length, or a date of birth later than today (server UTC date)
**When** the user attempts to create the pet
**Then** the system blocks the creation, records nothing, and tells the user which field is invalid in plain language

### AC-03 (US-01) — cross-context

**Given** an Authenticated user whose new-pet (or updated-pet) details reference a pet type that does not exist
**When** the user attempts to save the pet
**Then** the system blocks the operation and tells the user the pet type is unknown

### AC-04 (US-02) — happy path

**Given** an Authenticated user and any existing pet
**When** the user views that pet
**Then** the system returns the pet's name, date of birth, and the pet type's display name — and does not embed the co-owner list (co-owners are seen via the separate US-06 view)

### AC-05 (US-03) — happy path

**Given** an Authenticated user
**When** the user lists pets
**Then** the system returns the pets in bounded pages with a stable default ordering and a maximum page size, and never includes any co-owner's credentials in the result

### AC-06 (US-04) — authorization

**Given** an Authenticated user who is not a Co-owner of a pet
**When** the user attempts to update that pet
**Then** the system denies the change and leaves the pet unchanged

### AC-06b (US-04) — happy path

**Given** a Co-owner of a pet supplying a full replacement — a name that is non-empty after trimming and within the maximum length, a date of birth no later than today (server UTC date), and an existing pet type (all three fields are required on every update; an update is a full replace, not a partial patch)
**When** the Co-owner updates the pet
**Then** the system persists the replacement and confirms the updated pet — without embedding the co-owner list — back to the Co-owner

### AC-07 (US-05) — authorization

**Given** an Authenticated user who is not a Co-owner of a pet
**When** the user attempts to delete that pet
**Then** the system denies the deletion and the pet remains

### AC-07b (US-05) — happy path

**Given** a Co-owner of a pet
**When** the Co-owner deletes the pet
**Then** the system removes the pet for all its Co-owners and clears its Membership links

### AC-08 (US-06) — happy path (privacy-constrained)

**Given** an Authenticated user and an existing pet
**When** the user views the pet's co-owners
**Then** the system returns each Co-owner's identity without ever exposing any Co-owner's password or other credentials

### AC-09 (US-07) — authorization

**Given** an Authenticated user who is not a Co-owner of a pet
**When** the user attempts to add a Co-owner to that pet
**Then** the system denies the change and the pet's Membership is unchanged

### AC-09b (US-07) — happy path

**Given** a Co-owner of a pet and another existing user who is not yet a Co-owner
**When** the Co-owner adds that user as a Co-owner
**Then** the system extends the pet's Membership to include the added user and confirms the updated Membership

### AC-09c (US-07) — idempotent (already a member)

**Given** a Co-owner of a pet and a target user who is already a Co-owner of that pet
**When** the Co-owner adds that user again
**Then** the system leaves the Membership unchanged and reports success (adding an existing Co-owner is idempotent, not an error)

### AC-10 (US-08) — domain invariant

**Given** a Co-owner of a pet that has exactly one Co-owner (themselves)
**When** the Co-owner attempts to remove the last Co-owner
**Then** the system blocks the removal and tells the Co-owner a pet must keep at least one owner (to remove the pet entirely, delete it instead)

### AC-10b (US-08) — domain invariant under concurrency

**Given** a pet with exactly two Co-owners, each simultaneously attempting to remove the other
**When** both removals are processed
**Then** the system preserves the no-orphan invariant, leaving the pet with at least one Co-owner

### AC-11 (US-08) — happy path

**Given** a Co-owner of a pet that has at least two Co-owners
**When** the Co-owner removes another Co-owner
**Then** the system updates the pet's Membership to exclude the removed user, the pet still has at least one Co-owner, and the system confirms the updated Membership

### AC-11b (US-08) — error (target not a member)

**Given** a Co-owner of a pet and a target user who is not a Co-owner of that pet
**When** the Co-owner attempts to remove that user
**Then** the system blocks the removal, leaves the Membership unchanged, and tells the Co-owner the target is not a co-owner of the pet

### AC-11c (US-08) — happy path (self-removal / leave)

**Given** a Co-owner of a pet that has at least two Co-owners
**When** that Co-owner removes themselves
**Then** the system updates the Membership to exclude them, the pet still has at least one Co-owner, and the system confirms the updated Membership

### AC-12 (US-02..US-08) — non-existent pet

**Given** an Authenticated user and a pet reference that does not correspond to any existing pet
**When** the user views, updates, deletes, or changes the membership of that pet
**Then** the system makes no change and tells the user no such pet exists — the same not-found outcome for reads and for writes (a write on a missing pet is not disguised as an authorization denial)

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 write operation (create/update/delete/membership change) | ≤ 300 ms *(provisional)* | request timing metric in the API |
| Latency p95 read operation (view/list/co-owners) | ≤ 200 ms *(provisional)* | request timing metric in the API |
| Availability / throughput | inherits the platform default — no feature-specific SLO this iteration | — |
| Membership consistency under concurrency | no-orphan invariant holds under concurrent Co-owner removal (≥1 Co-owner always) | enforced transactionally; verified by a concurrent-removal test |

> The latency figures are provisional placeholders (no measured baseline exists — the module is unwired and the repo has no perf SLO); confirm or replace them per the §8 open question before the interface is locked. The read p95 target assumes the list is paginated with a bounded page size (§5 AC-05), so it does not degrade as the pet count grows. The concurrency row is a real requirement derived from the no-orphan invariant.

## 6.1 Security / privacy

- **Data classification:** internal — pet records and co-owner identities are user data (not regulated), but a pet's co-owner list discloses user identity and must be minimized.
- **Personal data touched:** the co-owner list exposes each Co-owner's identity (name); it must **never** expose passwords/credentials. Whether it may include email is an open question (§8).
- **AuthZ/AuthN impact:** authentication is already global; this feature adds a per-pet **membership** authorization check that runs on every write path (update, delete, add-co-owner, remove-co-owner) — the caller must be a Co-owner of the target pet. Reads are open to any Authenticated user by design (read-all). The check has no framework backstop, so every write path must re-verify it.
- **Abuse cases:**
  - Enumeration + PII scrape (read-all over sequential ids): any Authenticated user can walk pets and harvest co-owner identities → responses expose minimal identity only, never credentials; email exposure deferred to §8.
  - Consent-less co-owner add: a Co-owner attaches an arbitrary user without their consent → accepted this iteration (direct add, non-goal §3); revisit with the invite feature.
  - Single co-owner destroys a shared pet (hard delete): any Co-owner deletes a multi-owner pet for everyone → accepted this iteration (no soft delete, §3); flagged for notification in §8.
  - Concurrent membership removal orphaning a pet → prevented by the transactional no-orphan invariant (AC-10b, §6 concurrency row).
  - Pet-type CASCADE wiping pets: deleting a pet type would silently destroy referencing pets → out of scope here; open question routed to the pet-type context (§8).
- **Security review:** Required — this feature introduces a new per-pet membership authorization boundary and exposes co-owner identity.

## 7. Metrics / KPIs

- **Pet operation coverage** — baseline: 0 of the 8 user-story operations implemented (module unwired), target: 100% implemented and passing within this feature's delivery.
- **Unauthorized write attempts blocked** — baseline: TBD (no pet endpoints exist to measure; establish via negative tests at implementation), target: 100% of non-member write attempts denied.
- **Sensitive-field exposure** — baseline: unknown (no serialization exists yet), target: 0 responses exposing a co-owner's password/credentials, verified by response-shape tests.

## 8. Open questions

- [ ] Should adding a Co-owner require the added user's consent? Default now: direct add, no consent (invite/consent flow deferred to the pet-invite feature). — owner: Tech Lead, due: before sdd:tasks
- [ ] Should the co-owner list expose email, or only name + id? Default now: name + id only, no email. — owner: Security Lead, due: before sdd:api
- [ ] The pet-type reference is a DB-level CASCADE today, so deleting a pet type would silently destroy referencing pets — should pet-type deletion be blocked while pets reference it? Default now: out of scope here; flagged for the pet-type feature. — owner: Tech Lead, due: before sdd:data-model
- [ ] When one Co-owner hard-deletes a shared pet, should the other Co-owners be notified? Default now: no notification this iteration. — owner: PM, due: post-MVP
- [ ] Confirm or replace the provisional §6 latency targets (≤300 ms write / ≤200 ms read) — no measured baseline exists yet. Default now: provisional placeholders. — owner: Tech Lead, due: before sdd:api
