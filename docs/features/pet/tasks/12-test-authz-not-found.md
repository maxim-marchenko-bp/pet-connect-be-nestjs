---
id: T12
title: "Add authorization and not-found negative tests across every write path (QG-1)"
layer: "tests"
deps: ["T7", "T8", "T9", "T10"]
acs: ["AC-06", "AC-07", "AC-09", "AC-12"]
files_hint: ["test/pet.e2e-spec.ts"]
owner: "Maksym Marchenko"
estimate: "M"
status: "todo"
---

# T12 — Add authorization and not-found negative tests across every write path (QG-1)

## Why

[Sad §10 QG-1](../sad.md) requires negative tests per write path asserting denial + unchanged state, plus a not-found test for a missing pet on every write route — the KPI target is 100% of non-member write attempts denied ([spec §7](../spec.md)). AC-12's not-found-before-authorization ordering (per [ADR-0001](../adr/0001-inline-service-layer-membership-check.md)) must hold on every path, not just one.

## What

- `test/pet.e2e-spec.ts`: for update, delete, add-co-owner, remove-co-owner — one test asserting a non-Co-owner caller is denied 403 with state unchanged (AC-06, AC-07, AC-09), and one test asserting a non-existent pet id returns 404 (never 403) on that same route (AC-12).

## Definition of Done

- [ ] all four write routes have a passing non-Co-owner-denied test with an unchanged-state assertion
- [ ] all four write routes have a passing not-found test for a missing pet, confirmed as 404 not 403
- [ ] lint + vet clean
