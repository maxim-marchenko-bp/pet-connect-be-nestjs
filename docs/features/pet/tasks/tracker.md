# Tracker — pet

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | Promote staged migrations, disable synchronize | migration | Maksym Marchenko | S | — | done |
| T2 | Pet DTOs, public types, mappers | domain | Maksym Marchenko | S | — | done |
| T3 | Wire PetModule + AppModule | infra | Maksym Marchenko | S | T1 | done |
| T4 | assertCoOwner helper | app | Maksym Marchenko | S | T3 | done |
| T5 | Create pet | app | Maksym Marchenko | M | T2, T3 | done |
| T6 | View + list pets | app | Maksym Marchenko | M | T2, T3 | done |
| T7 | Update pet | app | Maksym Marchenko | M | T4, T5 | done |
| T8 | Delete pet | app | Maksym Marchenko | S | T4 | done |
| T9 | View + add co-owner | app | Maksym Marchenko | M | T4 | done |
| T10 | Remove co-owner (no-orphan invariant) | app | Maksym Marchenko | M | T4 | done |
| T11 | Concurrent no-orphan test | tests | Maksym Marchenko | M | T10 | done |
| T12 | Authz + not-found negative tests | tests | Maksym Marchenko | M | T7, T8, T9, T10 | done |
| T13 | Privacy response-shape tests | tests | Maksym Marchenko | S | T5, T6, T9 | done |

**Total:** 13 tasks, ~8 person-days.
