# Database

This directory contains the database layer for the JARVIS Content Automation Suite.

## Structure

```
db/
├── index.ts          # Database client export and connection management
├── schema/           # Table/model definitions (future)
├── migrations/       # Database migrations (future)
└── seeds/            # Seed data for development (future)
```

## Configuration

Set the `DATABASE_URL` environment variable in `.env.local` to connect to your database.

See `.env.example` for the full list of database-related environment variables.
