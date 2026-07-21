# Context — pet (feature-scoped)

> Feature-scoped glossary. Readers merge this with the repo-root `CONTEXT.md` (none yet);
> the per-feature entry wins on conflict. Keep terms domain-level, not technical.

## Glossary

- **Authenticated user** — any signed-in user (holds a valid session). May create pets and may view/list any pet. Only becomes able to modify a specific pet by being a Co-owner of it. NOT: a global administrator — there is no admin role in this feature.
- **Co-owner** (a.k.a. **member**) — an Authenticated user who is a member of a specific Pet via the pet↔user membership link. May edit that pet, delete it, and add/remove other Co-owners of it. The creator of a pet is automatically its first Co-owner. NOT: merely a viewer — viewing is open to every Authenticated user (read-all).
- **Pet** — the domain object for an animal, with a name, a date of birth, and a Pet type. A Pet is co-owned by one or more Co-owners and must always have at least one (the no-orphan invariant). NOT: a Pet type (the species/category), which is a separate lookup.
- **Pet type** — an existing lookup value (e.g. dog, cat) that a Pet must reference. Owned by the separate pet-type context; a Pet cannot reference a Pet type that does not exist. NOT: a free-text label on the Pet.
- **Membership** — the set of Co-owners of a Pet (the pet↔user link). Managed within this feature: add a Co-owner, remove a Co-owner (but never the last one). NOT: the separate invite/join/assign flows listed in `TODO.md`, which are future features.
