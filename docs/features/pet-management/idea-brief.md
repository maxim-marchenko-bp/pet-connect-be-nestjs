---
status: Confirmed
owner: "TBD — PM + Tech Lead"
reviewers: []
updated_at: "2026-09-25"
feature_size: M
stage: "01"
depth: easy
ticket: ""
value_score:
  rice: 113
  state: confirmed
  confirmed_at: "2026-09-25"
feasibility_state: confirmed
---

<!-- Stage 01 → see ../SKILL.md (interview skill) -->
<!-- Why: capture the idea before it's forgotten or retold incorrectly -->

# Idea Brief — Pet Management

## 1. Raw idea
pet feature is about managing pets. pets can be added by another user and can be assigned to any of the users via shared link. basic CRUD operations with filtering like we have in users feature.

## 2. Problem
Users of pet-connect have no way to create or manage pet records within the platform. Multiple people who share responsibility for a pet (family members, co-owners) cannot both access the same record — one person owns the data and others are locked out. This creates a support burden when users ask manually for access corrections.

## 3. Users
Primary segment: **co-owners** — two or more people who share responsibility for a pet (e.g., partners, family members) who need to read and update the same record without going through the original creator every time.
Secondary segment: individual pet owners who want a single digital record for their pet within pet-connect.
Frequency: any time a pet record needs to be created, updated, or viewed.

## 4. Why now
The platform is called "pet-connect" and has no pet entity yet. Users currently have no structured way to manage pets, forcing manual workarounds or support requests. Building this now unblocks every downstream feature that references a pet (appointments, social connections, etc.).

## 5. Out of scope
- Pet health records / medical history
- Pet social features (photos feed, likes, comments)
- Notifications / reminders (vet appointments, medications)
- Third-party integrations (vet systems, pet shops)
- Role-based permission levels (Owner / Editor / Viewer) — see §14

## 6. Competitive analysis
| # | Product · URL | Features | Value per feature (1-5) | Gap |
|---|---|---|---|---|
| 1 | Pet Co-Parent · [apps.apple.com/us/app/pet-co-parent/id6757497605](https://apps.apple.com/us/app/pet-co-parent/id6757497605) | Shared care coordination, centralized pet info hub, real-time updates | 4 / 3 / 4 | iOS-only native app; not embeddable in a platform API; no CRUD filtering |
| 2 | PawPal · [pawpalapp.com/family-pet-sharing](https://www.pawpalapp.com/family-pet-sharing) | Role-based access (Owner/Caretaker/Viewer), granular per-role permissions | 4 / 3 | Complex role setup for simple shared ownership; standalone app, not API-first |
| 3 | CorePaw · [corepaw.app/family-pet-sharing](https://www.corepaw.app/family-pet-sharing) | Co-owner full access, document sharing, selective activity-based permissions | 5 / 4 | Activity-centric architecture, not plain entity CRUD; no shared-link invite pattern |
| 4 | PetNexa · [petnexa.app](https://www.petnexa.app) | Individual pet health profiles, multi-user visibility | 4 / 2 | Focused on health records, not shared management; no flat co-ownership model |

_Footnotes: searched 2026-09-25, query "pet management app shared access co-owner family pet profile 2026"._

## 7. Strategic approaches

### Approach A — Single Owner, Invite-Only Viewer
- **Thesis**: One user owns a pet; invited users can only view — simplest access model
- **For whom**: Primary caregivers who want to share read-only access with family or a vet
- **Outcome metric**: Support tickets for pet record access → 0 within 4 weeks
- **Key trade-off**: Viewers cannot help maintain the record; sole owner becomes a bottleneck
- **Effort signal**: S
- **Recommended?** ◯

### Approach B — Role-Based Pet Access
- **Thesis**: Owners assign roles (Owner / Editor / Viewer) per user per pet — maximum control for multi-person households
- **For whom**: Households with many caregivers who need different levels of control
- **Outcome metric**: % of pets with 2+ assigned users within 30 days → target 40%
- **Key trade-off**: High complexity; UX friction during role assignment may deter adoption
- **Effort signal**: L
- **Recommended?** ◯

### Approach C — Equal-Access Co-Ownership via Shared Link
- **Thesis**: Any user with the shared link joins as a co-owner with full CRUD access — flat, fast, and clear
- **For whom**: Co-owners (family, partners) who jointly manage a pet and need equal access
- **Outcome metric**: Support tickets for pet record issues → 0 within 4 weeks of launch
- **Key trade-off**: No granular control; any co-owner can delete the pet; link scope is all-or-nothing
- **Effort signal**: M
- **Recommended?** ●

## 8. Multi-perspective feedback

### Engineer
- Approach A: Trivial access check (creator = owner, all others = viewer); minimal surface area; no new token mechanism needed
- Approach B: Role validation required on every CRUD operation; permission table adds data model complexity; large integration surface
- Approach C: Access check — is user the creator OR in the co-owner list? Manageable; shared-link token generation is a new but bounded mechanism

### Executive
- Approach A: Covers the basic use case but misses the co-ownership value prop; no differentiation from a plain list endpoint
- Approach B: Premium positioning — role-based access can become a paid tier; L effort risk delays time-to-market
- Approach C: Good ROI — delivers the "connect" value (shared access) at M effort; aligns directly with the "pet-connect" brand

### UX-researcher
- Approach A: Simple to understand; users may feel locked out of a shared pet record they actively help care for
- Approach B: "What's the difference between Editor and Owner?" — confusing for non-technical users; high onboarding friction
- Approach C: Clear mental model — share link → anyone who joins has full access; discoverable; users may not realize any co-owner can delete

### Synthesis matrix
|        | Engineer | Executive | UX |
|--------|:--------:|:---------:|:--:|
| App. A | + simple, no auth logic | - misses co-ownership value | + zero confusion |
| App. B | - high complexity, large surface | + premium differentiator | - role confusion on boarding |
| App. C | 0 bounded complexity | + good ROI, brand fit | + clear link → co-owner model |

## 9. Trade-offs and edge cases

### Trade-offs per approach
| Approach | Pros | Cons |
|---|---|---|
| A | Fastest to build, no access-control complexity | Misses co-ownership; no platform differentiation |
| B | Maximum control; premium roadmap item | L effort; high UX friction; delays launch |
| C | Delivers co-ownership at M effort; clear UX | No role differentiation; all co-owners can delete |

### Edge cases
1. Owner deletes their account — pet becomes ownerless; co-owners lose access
2. Shared link posted publicly — unlimited strangers join as co-owners
3. Two co-owners update the same pet record simultaneously — last-write-wins conflict
4. Co-owner deletes the pet — no deletion guard in flat co-ownership model
5. Link revocation — original creator cannot remove a co-owner after they've joined
6. User accepts shared link for a pet they already have independently (potential duplicate records)
7. Filtering at scale: user has hundreds of co-owned pets alongside their own — pagination performance

## 10. Risks
- **Critical — shared-link abuse**: a link with no expiry or rate-limit can be posted publicly, allowing unlimited strangers to join as co-owners; without revocation and audit logging, the creator cannot detect or undo this
- Any co-owner can delete the pet — no deletion guard in flat model
- Orphaned pets on account deletion — data integrity risk
- "My pets" filter may silently exclude co-owned pets, confusing users about what they can access

## 11. RICE — Claude proposed
- **Reach (R)**: 300 — every active user interacts with pets as the core entity (§3 Users)
- **Impact (I)**: 3 — without pets the platform has no data layer; massive per-user impact (§2 Problem, §8 Executive)
- **Confidence (C)**: 0.5 — shared-link security mechanism not yet designed; deletion semantics open (§15 Open questions)
- **Effort (E)**: 4 person-weeks — M effort, reusing the users module CRUD + filter pattern (§7 Approach C effort signal)
- **RICE = 300 × 3 × 0.5 / 4 = 113**
- **State**: confirmed

## 12. Feasibility — Claude proposed
- [☑] **Tech**: same NestJS CRUD + filter pattern as `src/modules/user/` and `src/modules/pet-type/`; `@AuthUser` decorator already handles ownership checks
- [☑] **Skills**: team shipped user CRUD, pet-type CRUD, JWT auth, and list filtering — all required skills are present
- [☐] **Time**: release window not yet defined — sprint slot must be allocated before PRD starts
- **State**: confirmed

## 13. Recommendation
**Selected: Approach C** — Equal-Access Co-Ownership via Shared Link.

With RICE = 113 (§11), this feature ranks as high-priority: full platform reach (R=300), maximum impact as the core data entity (I=3), at M effort reusing established patterns. Feasibility is Tech ☑ and Skills ☑ based on the repo scan (§12), with Time ☐ flagged as an open item — a sprint slot must be confirmed before the PRD phase starts. The synthesis matrix (§8) shows Approach C is the only option with no "−" across all three lenses: bounded complexity for engineering, good ROI for the business, and a clear mental model for users. Competitively, Pet Co-Parent and CorePaw both use flat equal-access co-ownership as their primary differentiator (§6), but neither is embeddable in a platform API — this feature fills that gap natively in pet-connect.

**Locked-in pointer**: the PRD phase should design around a flat co-ownership model: one invite link per pet, all co-owners have equal CRUD rights, with link revocation as a required v1 safety mechanism.

## 14. Parked & rejected approaches
| # | Approach | Status | Reason | Revisit trigger |
|---|---|:---:|---|---|
| A | Single Owner, Invite-Only Viewer | parked | Misses co-ownership value; viewers locked out of updates | Revisit if co-editing demand is empirically low 60 days post-launch |
| B | Role-Based Pet Access | parked | L effort; UX too complex for v1; delays time-to-market | Revisit when co-ownership adoption > 40% and a premium tier is planned |

## 15. Open questions
- [ ] Shared-link security design: should links be single-use, time-limited, or revocable? — owner: Tech Lead, due: before PRD start
- [ ] What happens to a pet record when the creator deletes their account? — owner: PM + Backend Lead, due: before PRD start
- [ ] Release window / sprint slot for pet-management — owner: PM, due: before Feasibility Time ☐ can be confirmed
- [ ] Should list filtering separate "my pets" (creator) from "co-owned pets"? — owner: PM + UX, due: PRD phase

## Related
- Existing CRUD pattern: `src/modules/user/` (controller, service, entity, filter)
- Existing entity pattern: `src/modules/pet-type/`
- Auth ownership pattern: `src/core/auth/decorators/auth-user.decorator.ts`
- List filter base: `src/common/list-filter/`

## DoD self-check
- [x] 15 sections present
- [x] No anti-pattern terms (Postgres/Redis/Kafka/etc.)
- [x] Length ≤ 5 pages (~2200 words)
- [x] Frontmatter status: Confirmed
- [x] RICE confirmed (state: confirmed)
- [x] Feasibility confirmed (state: confirmed)
- [x] Recommendation present with rationale citing 4 upstream sections (§6, §8, §11, §12)
