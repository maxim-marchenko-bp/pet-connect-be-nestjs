---
status: Accepted
owner: "Maksym Marchenko"
reviewers: ["Tech Lead"]
updated_at: "2026-07-21"
feature_size: "S"
ticket: "TODO.md — Pet endpoint checklist"
---

# 0002 — Guard the no-orphan invariant with a pessimistic-lock transaction

- **Status:** Accepted
- **Date:** 2026-07-21
- **Deciders:** Maksym Marchenko (Architect), Tech Lead

## Context

A Pet must always keep at least one Co-owner (the no-orphan invariant). AC-10b and the spec §6 concurrency row require this to hold even under concurrency: when a pet has exactly two Co-owners and each simultaneously removes the other, the pet must not be left with zero owners. A naive count-then-remove is racy — both transactions read two owners, both proceed, and the pet is orphaned.

## Decision drivers

- No-orphan invariant must hold under concurrent Co-owner removal (spec §6 concurrency row, AC-10b).
- The invariant is over a single pet's membership rows — a narrow, well-bounded contention scope.
- The repo already uses TypeORM against PostgreSQL; no new infrastructure is needed.

## Considered options

1. **Pessimistic write-lock transaction** — remove-co-owner runs in a transaction that takes a `pessimistic_write` lock on the pet and its membership, counts remaining owners inside the lock, rejects a removal that would reach zero, and commits. Concurrent removals on the same pet serialize on the lock.
2. **Serializable isolation + retry** — run the removal under `SERIALIZABLE` isolation and retry the transaction on a serialization failure (Postgres `40001`).

## Decision outcome

**Chosen:** Option 1 — a pessimistic write-lock transaction. For an invariant scoped to a single pet's membership rows, a targeted row lock is the simplest correct mechanism and needs no retry/backoff wrapper. `SERIALIZABLE` is also correct but heavier and requires a retry loop, which is unwarranted for this narrow contention scope.

## Consequences

**Positive**
- The invariant is enforced deterministically; the concurrent-removal test (QG-2) passes without retry flakiness.
- No new infrastructure — uses TypeORM's built-in pessimistic locking on the existing Postgres store.

**Negative**
- Concurrent removals on the *same* pet serialize, adding minor latency under contention (acceptable — removals are rare and per-pet).
- The removal path must own an explicit transaction boundary, slightly more code than a plain `save`.

**Neutral**
- Switching to serializable-isolation-with-retry later is possible if contention patterns ever change.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4, §8
- Related ADR: [[0001-inline-service-layer-membership-check]]
