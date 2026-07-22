# Changelog — pet

## pet — finish the Pet module: CRUD + co-owner membership

**What:** Authenticated users can now create, view, list, update, and delete pets, and manage a pet's co-owners (add/remove) — the `Pet` entity existed but had no controller, service, or wiring until this feature.

**Why:** Pets are the spine of the product; every downstream flow (pet invites, per-pet activity) depends on pets and their co-ownership existing first ([spec](spec.md) §1). Read-all/write-members access is enforced per-operation rather than by a framework guard ([ADR-0001](adr/0001-inline-service-layer-membership-check.md)); concurrent co-owner removal cannot leave a pet ownerless, enforced with a pessimistic lock ([ADR-0002](adr/0002-pessimistic-lock-no-orphan-invariant.md)).

**How to use:** `POST /api/pets` to create (creator becomes first co-owner), `GET /api/pets/:id` / `GET /api/pets` to view/browse, `PUT /api/pets/:id` for a full-replace update, `DELETE /api/pets/:id` to hard-delete, `POST /api/pets/:id/co-owners` / `DELETE /api/pets/:id/co-owners/:userId` to manage membership — see [openapi.yaml](contracts/openapi.yaml).

**Operational notes:**
- Migration: promotes the staged `docs/features/pet/migrations/01..05_*.sql` pairs (user, pet_type, pet, user_pets, refresh_token) into the live migration tree — run `npm run migration:run` on deploy; each has a paired `.down.sql` for rollback.
- Feature flag / config: none.
- Rollback: `npm run migration:revert` per migration, then revert the deploy.

**Acceptance criteria delivered:** AC-01 through AC-12 (including AC-05, 06b, 07b, 09b/c, 10b, 11b/c) — full pet CRUD, co-owner add/remove, the no-orphan invariant under concurrent removal, list-pagination clamping, and privacy (no credential fields ever returned).
