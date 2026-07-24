# JARVIS Database Architecture

This document outlines the Persistence Layer for the JARVIS Operating System using Prisma ORM.

## Entity Relationship Overview

The schema is heavily normalized to support the 18+ features within the JARVIS suite. The primary aggregate roots are:

1. **User & Settings**: A `User` maintains a 1-to-1 relationship with `Settings` (which stores an extensible JSON blob for massive UI configuration state).
2. **Knowledge Hub**: Hierarchical `KnowledgeFolder` records map to `KnowledgeItem`s (1-to-N). Items have N-to-N relationships with `Tag`s.
3. **Prompts**: `PromptCategory` -> `Prompt` -> `PromptVersion`. (1-to-N). Soft-versioning is built in.
4. **Research**: `FeedCategory` -> `Feed` -> `Article` -> `Bookmark`. 
5. **Automation**: `Workflow` maps to many `WorkflowExecution`s.

## Naming Conventions
- **Models**: PascalCase (e.g. `KnowledgeItem`).
- **Fields**: camelCase.
- **Foreign Keys**: `[modelName]Id` (e.g. `userId`, `folderId`).

## Repository Pattern
To maintain strict separation of concerns, the UI and API handlers **must never** interact with `prisma` directly.
All queries must flow through dedicated classes in `src/lib/db/repositories/`. 

```typescript
// Correct:
const settings = await settingsRepo.getSettings(userId);

// Incorrect:
const settings = await prisma.settings.findUnique({ ... });
```

## Migration Strategy
We use Prisma Migrations (`npx prisma migrate dev` / `npx prisma migrate deploy`).
For TiDB Cloud Serverless (MySQL), we use `npx prisma db push` during rapid prototyping to sync schema state immediately without heavy migration locks.

## Backup Strategy
The `db:backup` command should be wired up to export metadata as JSON payloads.
For the production cloud deployment on TiDB, automatic snapshots run nightly.

## Development Workflow
1. Modify `prisma/schema.prisma`.
2. Run `npm run db:push` to sync database schema.
3. Run `npm run db:generate` to regenerate TypeScript types for the UI.
4. Run `npm run db:seed` to repopulate default tags/prompts.
