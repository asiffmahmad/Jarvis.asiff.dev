# Configuration Guide

JARVIS employs a strict separation of configuration values from business logic. All environment-agnostic system boundaries are defined in `src/config/`.

## The `src/config/` Architecture

1. **`app.config.ts`**
   - **Responsibility:** Global application identifiers, marketing URLs, feature flags, and standard IDs (like Agent tags).
2. **`ai.config.ts`**
   - **Responsibility:** LLM model mappings, token limits, temperature presets, and provider registries.
3. **`integrations.config.ts`**
   - **Responsibility:** Third-party platform definitions (GitHub, Notion, Slack) and polling intervals.
4. **`scheduler.config.ts`**
   - **Responsibility:** Cron strings for background tasks and batch size limitations.
5. **`theme.config.ts`**
   - **Responsibility:** Z-index architecture and standardized Framer Motion timing functions.

*Never* duplicate these strings in standard React components. Always import the relevant `_CONFIG` object.
