---
status: Approved
owner: "TBD — PM + Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-09-28"
feature_size: "M"
stage: "03"
ticket: "TBD"
---

# PRD — pet-management

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](./CONTEXT.md)
> **Reference module:** patterns reused from the existing `user` module and `pet-type` module (CRUD + list filtering), and the `@AuthUser` ownership decorator, as cited in idea-brief §Related. No new reference module inspected beyond these established patterns.
> **External context channels used:** None — only CONTEXT + idea-brief (no architecture-map, no Atlassian, no knowledge-base configured).

## 1. Context

pet-connect currently has no way for its users to create or manage pet records. People who jointly care for a pet — partners, family members, the co-owners described in idea-brief §3 — cannot both reach the same record: one person holds the data and everyone else is locked out, which generates manual support requests for access corrections. This PRD covers the first-class pet record entity that unblocks this, for the primary segment of co-owners and the secondary segment of individual pet owners.

The trigger is foundational: the platform is named "pet-connect" yet has no pet entity, so every downstream capability that references a pet (appointments, social connections) is blocked until this exists. Building it now removes the manual access workarounds and establishes the core data object the rest of the product depends on.

The committed approach (idea-brief §13) is flat, equal-access co-ownership via a shareable link: one invite link per pet record, and every co-owner holds equal day-to-day management rights. During the interview we refined two safety points on top of that flat model — the creator alone may delete the record or revoke its link, and if a creator deletes their account those two rights transfer to the earliest-joined co-owner so records are never orphaned.

Traceability & decisions:
- Reference patterns: CRUD + list filtering mirror the existing `user` module; ownership checks follow the established `@AuthUser` decorator pattern (idea-brief §12, §Related).
- Interview decision — shared link is revocable with no expiry (one reusable link per pet record).
- Interview decision — creator account deletion transfers delete + revoke rights to the earliest-joined co-owner.
- Interview decision — delete authority is creator-only (a light guard over the otherwise flat model).
- Interview decision — the pet list is combined (created + co-owned) with an optional filter, so co-owned pets are never silently hidden.

## 2. Goals

- Co-owners jointly manage a single pet record with equal create/read/update rights, without routing every change through the creator (idea-brief §13).
- A creator brings another person onto a pet record through a single shareable link and can revoke that access at any time (idea-brief §13 locked-in pointer).
- Manual support requests for pet-record access corrections are eliminated (idea-brief §2, §7 Approach C outcome).

## 3. Non-goals

- Pet health records / medical history — deferred, not part of the core management entity (idea-brief §5).
- Pet social features (photo feed, likes, comments) — out of scope; a separate initiative (idea-brief §5).
- Notifications / reminders (vet appointments, medications) — out of scope for v1 (idea-brief §5).
- Third-party integrations (vet systems, pet shops) — out of scope (idea-brief §5).
- Role-based permission levels (Owner / Editor / Viewer) — parked as Approach B; v1 uses the flat co-ownership model instead (idea-brief §5, §14).

## 4. User stories

### US-01: Create a pet record

**As a** creator
**I want** to create a pet record with its basic details
**So that** I have a single digital record for my pet within pet-connect

### US-02: Share a pet record

**As a** creator
**I want** to produce a shareable link for a pet record
**So that** I can invite another person to help manage it

### US-03: Join as a co-owner

**As a** co-owner
**I want** to join a pet record through a shared link
**So that** I gain equal day-to-day access to that pet's record

### US-04: Update a shared pet record

**As a** co-owner
**I want** to update the details of a pet record I co-own
**So that** I can help keep the record accurate without asking the creator

### US-05: List and filter my pets

**As a** co-owner
**I want** to see all pet records I can access in one list, with a filter for created vs co-owned
**So that** I can find any pet without losing track of the ones shared with me

### US-06: Delete a pet record

**As a** creator
**I want** to delete a pet record I created
**So that** I can remove a record that is no longer needed

### US-07: Revoke a shared link

**As a** creator
**I want** to revoke a pet record's shared link
**So that** no new people can join after I stop sharing

### US-08: Retain access when the creator leaves

**As a** co-owner
**I want** to keep managing a shared pet record even if its creator deletes their account
**So that** a pet we jointly care for is never orphaned or lost

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** an authenticated creator
**When** the creator submits a new pet record with valid details
**Then** the system records the pet and confirms it, showing the creator as having access to it

### AC-02 (US-02) — happy path

**Given** a creator who owns a pet record
**When** the creator requests a shareable link for that pet record
**Then** the system produces a single reusable link the creator can pass to another person

### AC-03 (US-03) — happy path

**Given** an authenticated platform user who holds a valid, un-revoked shared link for a pet record they do not yet have access to
**When** the user opens the link to join
**Then** the system adds the user as a co-owner with equal create, read, and update access to that pet record

### AC-04 (US-03) — error

**Given** an authenticated platform user who opens a shared link that the creator has revoked
**When** the user attempts to join through it
**Then** the system blocks the join and explains in plain language that the link is no longer valid

### AC-05 (US-04) — happy path

**Given** a co-owner of a pet record
**When** the co-owner submits valid updated details for that record
**Then** the system saves the changes and confirms them to the co-owner

### AC-06 (US-04) — error

**Given** a co-owner of a pet record
**When** the co-owner submits updated details that are invalid or incomplete
**Then** the system blocks the change and explains which detail is invalid in plain language

### AC-07 (US-06) — authorization

**Given** a co-owner who is not the creator of a pet record
**When** the co-owner attempts to delete that pet record
**Then** the system denies the action and explains that only the creator may delete the record

### AC-08 (US-06) — happy path

**Given** the creator of a pet record
**When** the creator deletes that pet record
**Then** the system removes the record, confirms the deletion, and its co-owners no longer have access

### AC-09 (US-05) — happy path

**Given** a co-owner who has both created pet records and joined others as a co-owner
**When** the co-owner views their pet list and applies the created-only or co-owned-only filter
**Then** the system shows all accessible records by default and narrows the list to the chosen filter, never omitting co-owned records from the default view

### AC-10 (US-07) — happy path

**Given** the creator of a pet record with an active shared link
**When** the creator revokes the link
**Then** the system invalidates it so no new person can join, while existing co-owners keep their access

### AC-11 (US-07) — authorization

**Given** a co-owner who is not the creator of a pet record
**When** the co-owner attempts to revoke that record's shared link
**Then** the system denies the action and explains that only the creator may revoke the link

### AC-12 (US-03) — domain invariant

**Given** a creator or existing co-owner of a pet record who already has access to it
**When** that person opens the record's shared link again
**Then** the system does not create a duplicate co-ownership and tells the person they already have access (one co-ownership per person per pet record)

### AC-13 (US-08) — cross-context

**Given** a pet record created by a creator and shared with one or more co-owners
**When** the creator deletes their platform account
**Then** the system keeps the pet record accessible and transfers the delete and link-revocation rights to the earliest-joined co-owner

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — create / update pet record | ≤ 300 ms | production request metrics |
| Latency p95 — read / list pet records | ≤ 250 ms | production request metrics |
| Throughput | ≥ 30 req/s per instance | smoke test in CI |
| Availability | 99.9% | monthly SLO window |
| Concurrent co-owner edits | last committed update wins; no record is lost or corrupted | conflict behavior asserted in tests |

## 6.1 Security / privacy

- **Data classification:** confidential — pet records are tied to identifiable platform users and are shared across co-owners, so access must be scoped to the creator plus joined co-owners.
- **Personal data touched:** pet attributes (e.g. name and basic descriptive details) linked to the owning users' identities; no new special-category personal data introduced.
- **AuthZ/AuthN impact:** new capabilities — create/read/update available to the creator and all co-owners of a record; delete and link-revocation restricted to the creator; joining a record gated by holding a valid, un-revoked shared link plus an authenticated identity. Stated surface-neutrally; `architecture-design` derives the surfaces.
- **Abuse cases:**
    - Access by a non-member: a user with neither creator nor co-owner standing tries to view a pet record → system hides its existence rather than revealing it.
    - Shared link posted publicly: unlimited strangers attempt to join → mitigated by creator revocation (v1) plus a rate limit on join attempts; business response is deny-and-throttle.
    - Spam-create: automated bulk creation of pet records → rate limit on record creation per user per minute (threshold in §8).
    - Revoked-link misuse: attempts to join through a revoked link → system denies and explains the link is no longer valid.
- **Security review:** Required — M-sized feature introducing a new authorization boundary (co-ownership) and a shared-link token mechanism.

## 7. Metrics / KPIs

- **Support requests for pet-record access corrections** — baseline: current manual request volume (measurement: count from the support queue over the 4 weeks before launch), target: 0 within 4 weeks of launch (idea-brief §7).
- **Pet-record creation adoption** — share of active users who create at least one pet record within 30 days — baseline: 0, target: ≥ 60% within 30 days of launch.
- **Co-ownership rate** — share of pet records with 2 or more co-owners within 30 days — baseline: 0, target: ≥ 25% within 30 days of launch.
- **Read/list latency p95** (post-release tracking, mirrors §6) — baseline: 0 (new feature), target: ≤ 250 ms sustained in the first 30 days.

## 8. Open questions

- [ ] What is the shared-link join rate-limit threshold (join attempts per minute per link)? Default now: rate-limited with the exact value deferred. — owner: Tech Lead, due: before /sdlc-architecture-design
- [ ] Are the p95 latency targets (≤300 ms write / ≤250 ms read) confirmed against the existing `user` module's production baseline? Default now: reuse the user-module targets. — owner: Tech Lead, due: before /sdlc-architecture-design
- [ ] Which release window / sprint slot is allocated for pet-management? Default now: unscheduled (Feasibility Time ☐ in idea-brief §12). — owner: PM, due: before /sdlc-break-tasks
