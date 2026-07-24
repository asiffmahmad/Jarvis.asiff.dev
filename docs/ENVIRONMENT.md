# Environment Variables

This document catalogs every environment variable used in JARVIS.

> **SECURITY NOTE:** Never commit `.env` or `.env.local` to version control.

### Application Core
- `NEXT_PUBLIC_APP_NAME`
  - **Purpose:** Name displayed in the UI.
  - **Default:** `JARVIS`
- `NEXT_PUBLIC_APP_URL`
  - **Purpose:** Base URL for absolute link resolution.
  - **Example:** `https://jarvis.example.com`
- `NODE_ENV`
  - **Purpose:** Node environment mode (`development` or `production`).

### Database
- `DATABASE_URL`
  - **Purpose:** Prisma connection string.
  - **Required:** Yes
  - **Example:** `mysql://user:pass@host:4000/db?sslaccept=strict`

### Authentication
- `AUTH_SECRET`
  - **Purpose:** Cryptographic key for session signing.
  - **Required:** Yes
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
  - **Purpose:** Bootstrapping the initial super-user during `npm run db:seed`.

### AI Providers (Future Extension)
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

### Feature Flags
- `NEXT_PUBLIC_ENABLE_AI_ASSISTANT`
  - **Purpose:** Toggles UI access to the global AI chat HUD.
  - **Default:** `true`
