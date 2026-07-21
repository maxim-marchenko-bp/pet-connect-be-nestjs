---
id: T13
title: "Add response-shape privacy tests (QG-3)"
layer: "tests"
deps: ["T5", "T6", "T9"]
acs: ["AC-01", "AC-05", "AC-08"]
files_hint: ["test/pet.e2e-spec.ts"]
owner: "Maksym Marchenko"
estimate: "S"
status: "todo"
---

# T13 — Add response-shape privacy tests (QG-3)

## Why

[Sad §10 QG-3](../sad.md) and [spec §7](../spec.md) set a 0-exposure KPI target: no pet, list, or co-owner response may ever expose a Co-owner's password or credentials. This is a cross-cutting response-shape assertion, separate from the functional tests each route already gets.

## What

- `test/pet.e2e-spec.ts`: response-shape assertions on `POST /api/pets` (AC-01), `GET /api/pets/list` (AC-05), and `GET /api/pets/:id/co-owners` (AC-08) — assert the JSON body has no `password` key anywhere, including nested co-owner entries.

## Definition of Done

- [ ] response-shape test passes for create/list/co-owners routes, asserting absence of any credential field
- [ ] lint + vet clean
