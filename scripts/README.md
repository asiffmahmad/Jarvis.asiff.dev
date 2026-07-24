# Scripts

This directory contains operational scripts for the JARVIS Content Automation Suite.

## Planned Scripts

| Script | Purpose |
|--------|---------|
| `seed.ts` | Seed the database with sample content |
| `migrate.ts` | Run database migrations |
| `generate-tokens.ts` | Generate design token exports |
| `health-check.ts` | Verify all external service connections |
| `deploy.ts` | Production deployment automation |

## Usage

Scripts are run via the project's package.json or directly with `npx tsx`:

```bash
npx tsx scripts/<script-name>.ts
```
