# Hardcoded Values Audit

This document tracks the extraction of magic strings, static keys, and duplicate configurations out of the application code and into the central `/config` architecture.

## Values Extracted & Replaced

| Value Found | Location | Replacement | Status |
|---|---|---|---|
| `"agent-research"`, `"agent-email"` | `src/app/page.tsx` | `APP_CONFIG.agents.*` | ✅ Replaced |
| `"JARVIS Operating System"` | `src/app/page.tsx` | `APP_CONFIG.name` | ✅ Replaced |
| `0.2`, `0.3` (Animation Speeds) | UI Components | `THEME_CONFIG.animations.*` | ✅ Mapped |
| `gpt-4-turbo` | Prompts / Tools | `AI_CONFIG.models.defaultText` | ✅ Mapped |
| `15 * 60 * 1000` | Research Service | `INTEGRATIONS_CONFIG.polling.*` | ✅ Mapped |
| `0 8 * * *` | Scheduler Service | `SCHEDULER_CONFIG.cron.*` | ✅ Mapped |

## Values Intentionally Retained
- **Tailwind Utility Classes (e.g., `text-jarvis-primary`)**: Retained. Extracting these into JavaScript variables defeats the performance benefits of the Tailwind JIT compiler.
- **Icon Maps**: Retained inside `sidebar.tsx` as they are UI-specific presentation logic, not systemic configuration.
