---
id: T11
title: "Add the concurrent no-orphan invariant test (QG-2)"
layer: "tests"
deps: ["T10"]
acs: ["AC-10b"]
files_hint: ["test/pet-co-owners-concurrency.e2e-spec.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T11 — Add the concurrent no-orphan invariant test (QG-2)

## Why

[Spec §6 concurrency row](../spec.md) and [AC-10b](../spec.md) require the no-orphan invariant to hold even when two Co-owners race to remove each other; [sad QG-2](../sad.md) names this as a required, separately verified quality gate exercising [ADR-0002](../adr/0002-pessimistic-lock-no-orphan-invariant.md)'s pessimistic-lock transaction.

## What

- `test/pet-co-owners-concurrency.e2e-spec.ts`: seed a pet with exactly two Co-owners; fire both `DELETE /api/pets/:id/co-owners/:userId` requests concurrently (each removing the other); assert the pet ends with exactly one Co-owner (never zero), and that exactly one request succeeds (the other resolves per T10's rejection path).

## Definition of Done

- [ ] the concurrent-removal test passes reliably (no flakiness across repeated runs) and asserts ≥1 Co-owner remains (AC-10b)
- [ ] lint + vet clean
