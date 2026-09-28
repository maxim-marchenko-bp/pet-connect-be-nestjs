# CONTEXT.md — pet-connect-be-nestjs

## Glossary

| Term | Definition |
|---|---|
| creator | The platform user who first created a pet record. Shares create/read/update rights with co-owners, and additionally holds two exclusive rights: deleting the pet record and revoking its shared link. On creator account deletion, these rights transfer to the earliest-joined co-owner |
| co-owner | A user who has been granted access to a pet record they did not create, via a shared invite link; holds equal create/read/update rights to the creator, but cannot delete the pet record or revoke its shared link |
| pet record | The structured entity representing a single pet within pet-connect; the core domain object that creators and co-owners manage (create, read, update, delete) |
| shared link | A URL token that allows another platform user to join a pet record as a co-owner; link design (expiry, revocability) is an open question — see `docs/features/pet-management/idea-brief.md §15` |
