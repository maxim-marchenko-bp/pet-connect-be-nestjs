---
status: Accepted
owner: "Maksym Marchenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-07-21"
feature_size: "S"
ticket: "TODO.md — Pet endpoint checklist"
---

# 0001 — Enforce per-pet membership with an inline service-layer check

- **Status:** Accepted
- **Date:** 2026-07-21
- **Deciders:** Maksym Marchenko (Architect), Tech Lead, Security Lead

## Context

The pet feature introduces a per-pet **membership** authorization boundary: reads are open to any Authenticated user, but every write (update, delete, add-co-owner, remove-co-owner) must be performed by a Co-owner of the target pet. The global `AuthGuard` only authenticates — it provides no backstop for this write-members rule (spec §6.1). Additionally, AC-12 requires that a write on a non-existent pet returns not-found, **not** an authorization denial.

## Decision drivers

- Write-members authorization must be enforced on every write path (spec §6.1, §5 AC-06/AC-07/AC-09).
- AC-12: a write on a missing pet must be not-found, never disguised as a 403.
- Repo convention: services throw `NotFoundException`/`ForbiddenException` directly; the loaded entity is needed by the mutation anyway.
- The pattern will be reused by downstream features (pet-invite, assign-pet).

## Considered options

1. **Inline service-layer check** — each write method loads the pet once (with its membership relation), throws `NotFoundException` if absent, then verifies the caller is in the membership set (else `ForbiddenException`) before mutating.
2. **Declarative `@CoOwner` guard/decorator** — a NestJS guard loads the pet by route param and checks membership before the handler runs.

## Decision outcome

**Chosen:** Option 1 — inline service-layer check, centralized in one `assertCoOwner(petId, callerId)` helper reused by every write path. It handles AC-12's not-found-before-authz ordering naturally (the service loads the pet it will mutate and distinguishes absent from unauthorized in one place), and stays within the repo's "services throw exceptions directly" convention. The guard option was rejected because returning 403 for a missing pet fights AC-12, and it would double-load the pet the service already needs.

## Consequences

**Positive**
- AC-12 (not-found vs forbidden) falls out cleanly — one load, one place to order the checks.
- No extra DB round-trip; the mutation reuses the pet the check loaded.
- Reusable helper gives downstream features one authorization pattern to follow.

**Negative**
- No framework-level enforcement — a future write path could forget to call the helper (mitigated by centralization + per-path negative tests; tracked in SAD §11).

**Neutral**
- Moving to a declarative guard later is possible but would need the AC-12 not-found nuance re-solved at guard level.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4, §8
- Related ADR: [[0002-pessimistic-lock-no-orphan-invariant]]
