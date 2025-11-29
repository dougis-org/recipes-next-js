# Prisma Migration Guide

This document outlines the commands and workflows for managing database schema migrations in this project.

## Prerequisites

Ensure you have the project dependencies installed:

```bash
npm install
```

## Running Migrations

To apply schema changes to your local database and create a new migration history entry, run:

```bash
npm run db:migrate
# OR directly via npx
npx prisma migrate dev
```
> **Note:** The `db:migrate` command uses `prisma migrate dev`, which is intended for development. It may prompt to reset the database on certain schema changes, which would lead to data loss.

### Creating a New Migration

When you run the command above after modifying `prisma/schema.prisma`, the CLI will:
1. Detect changes in your schema.
2. Prompt you for a name for the migration (e.g., `add_user_model`).
3. Create a new SQL migration file in `prisma/migrations/<timestamp>_<name>`.
4. Apply the SQL to your local database.
5. Generate the Prisma Client.

**Versioning:** Prisma automatically handles versioning using a timestamp prefix on the migration folder. You do not need to manually increment version numbers.

## Resetting the Database

If you need to completely wipe the database and re-apply all migrations (useful for development if you end up in an inconsistent state):

```bash
npm run db:reset
```

> **Warning:** This command will delete all data in your local database. Since the `db:reset` script uses `--force`, it will **not** ask for confirmation.

## Seeding the Database

To populate the database with initial data (defined in `prisma/seed.ts`):

```bash
npm run db:seed
```

This is often run automatically after `db:reset`.

## Production Migrations

For deploying migrations to production (or staging), use:

```bash
npx prisma migrate deploy
```

This command applies all pending migrations without resetting the database or generating artifacts (which should be done during build).
