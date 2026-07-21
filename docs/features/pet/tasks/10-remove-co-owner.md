---
id: T10
title: "Implement remove co-owner under the no-orphan invariant (DELETE /api/pets/:id/co-owners/:userId)"
layer: "app"
deps: ["T4"]
acs: ["AC-10", "AC-10b", "AC-11", "AC-11b", "AC-11c", "AC-12"]
files_hint: ["src/modules/pet/pet.service.ts", "src/modules/pet/pet.controller.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T10 — Implement remove co-owner under the no-orphan invariant (DELETE /api/pets/:id/co-owners/:userId)

## Why

Derives from [spec US-08 / AC-10 / AC-10b / AC-11 / AC-11b / AC-11c / AC-12](../spec.md), [sad Flow 2 (concurrent race) & Flow 10 (single request)](../sad.md). The no-orphan invariant under concurrency is enforced per [ADR-0002](../adr/0002-pessimistic-lock-no-orphan-invariant.md) — a pessimistic write-lock transaction, not naive count-then-remove.

## What

- `PetService.removeCoOwner(id, targetUserId, callerId)`: calls `assertCoOwner(id, callerId)` (T4, AC-12/authz); opens a transaction with `pessimistic_write` lock on the pet's membership; verifies `targetUserId` is currently a member (else `NotFoundException`, AC-11b, per openapi's 404 for "target not a co-owner"); counts remaining owners inside the lock — rejects with `ConflictException` if removal would reach zero (AC-10); otherwise removes the link, commits, returns the updated co-owner list (AC-11 for another member, AC-11c for self-removal — same code path).
- `PetController @Delete(':id/co-owners/:userId')`.

## Definition of Done

- [ ] integration test: lone Co-owner attempting self-removal is rejected 409, "must keep at least one owner" (AC-10)
- [ ] integration test: removing another Co-owner from a ≥2-owner pet succeeds, ≥1 owner remains, updated list returned (AC-11)
- [ ] integration test: removing a non-member target is rejected 404, membership unchanged (AC-11b)
- [ ] integration test: self-removal from a ≥2-owner pet succeeds, ≥1 owner remains (AC-11c)
- [ ] integration test: missing pet 404s before the authz check (AC-12)
- [ ] lint + vet clean

## Notes

The concurrent-removal race itself (AC-10b) is verified separately by T11 — this task's DoD covers the single-request logic the transaction relies on.
