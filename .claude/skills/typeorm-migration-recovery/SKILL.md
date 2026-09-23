---
name: typeorm-migration-recovery
description: Use when a TypeORM migration fails, is partially applied, gets out of sync with the database, or a migration/deployment leaves the PostgreSQL schema in an inconsistent state. Use when you need to diagnose, recover, revert, or safely re-run NestJS TypeORM migrations.
allowed-tools: Bash, Read, Grep
-------------------------------

# TypeORM Migration Recovery

## Checklist

### Diagnose the current state

* [ ] Check the current git branch and working tree before changing migration files.
* [ ] Inspect the migration that failed and identify the SQL statements it contains.
* [ ] Check the TypeORM migration status.
* [ ] Check the database `migrations` table to determine which migrations are recorded as applied.
* [ ] Inspect the actual PostgreSQL schema affected by the failed migration.
* [ ] Compare the database state with the expected state from the migration source code.
* [ ] Determine whether the migration failed before or after its database changes were committed.

### Choose the recovery strategy

* [ ] If the migration was never recorded as applied and made no persistent changes, fix the migration and re-run it.
* [ ] If the migration partially changed the schema but is not recorded as applied, manually reconcile the database before re-running it.
* [ ] If the migration is recorded as applied but the expected schema is missing, investigate the migration transaction and database state before changing the migrations table.
* [ ] If the migration was already applied in production, do not edit the historical migration unless the repository's migration policy explicitly allows it.
* [ ] Prefer creating a corrective migration when the existing migration has already been applied to a shared environment.
* [ ] Do not delete rows from the `migrations` table as a first-line recovery step.

### Recover

* [ ] Back up the affected database or confirm that an existing backup is available before destructive changes.
* [ ] Make the smallest database change required to restore consistency.
* [ ] Keep the migration history and actual schema consistent.
* [ ] Run the migration status check again.
* [ ] Re-run the migration only after confirming that its preconditions are satisfied.
* [ ] Run the application's database verification/tests after recovery.
* [ ] Review the generated SQL before applying a newly generated migration.

### Validate

* [ ] Confirm that the migration appears in the migration history exactly once.
* [ ] Confirm that the expected tables, columns, indexes, constraints, and foreign keys exist.
* [ ] Run the relevant NestJS tests.
* [ ] Run typecheck and lint.
* [ ] Confirm that the migration works from a clean database when practical.

## Useful commands

Check migration status:

```bash
npm run typeorm migration:show
```

Run pending migrations:

```bash
npm run typeorm migration:run
```

Revert the latest migration:

```bash
npm run typeorm migration:revert
```

Generate a migration after confirming the entity/schema difference:

```bash
npm run typeorm migration:generate -- src/database/migrations/<MigrationName>
```

Inspect migration history directly:

```sql
SELECT * FROM migrations ORDER BY timestamp;
```

Inspect PostgreSQL schema:

```sql
\d <table_name>
```

## Gotchas

* [ ] Do not assume `migration:revert` can undo a migration that failed halfway through. TypeORM's migration history and the actual PostgreSQL schema can be temporarily inconsistent.
* [ ] Do not manually delete a row from `migrations` just to make `migration:run` execute again. First establish what schema changes already happened.
* [ ] Do not edit an already-applied production migration to fix a new schema requirement. Create a new corrective migration instead.
* [ ] Do not trust entity definitions alone when diagnosing a migration failure. Inspect the real PostgreSQL schema.
* [ ] Check foreign keys and indexes explicitly. A migration can fail on a constraint even when the table and columns already exist.
* [ ] Be careful with migrations that contain multiple schema operations. A failed operation may leave the database in a state that does not match the migration source.
* [ ] Never run destructive SQL against production until the affected objects and intended result have been verified.
* [ ] After recovery, verify both migration history and actual schema; checking only one of them is insufficient.
