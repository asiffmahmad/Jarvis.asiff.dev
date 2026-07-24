# Contributing to JARVIS

We welcome contributions to the JARVIS Operating System! To maintain the high production standards of this project, please adhere to the following workflow.

## 1. Development Workflow
1. Branch off `main` for all features/fixes.
2. Naming convention: `feat/issue-123-description` or `fix/issue-123-description`.
3. Run `npm run dev` to test locally.
4. If modifying the database, run `npx prisma db push` and `npx prisma generate`.

## 2. Coding Standards
- **Strict TypeScript:** No `any` types. Ensure all interfaces are explicitly defined.
- **Design DNA:** You **must** follow the glassmorphism aesthetic (borders, backdrops, `text-glow`). Do not introduce generic, unstyled Tailwind elements.
- **Component Modularity:** UI logic and Business logic must be separated. Do not execute Prisma queries inside React Components.

## 3. Pull Request Guidelines
Before opening a PR, you MUST ensure the following checks pass locally:
```bash
npm run lint
npx tsc --noEmit
npm run build
```

Your PR description should include:
- What was changed.
- Why it was changed.
- Screenshots of UI changes.

## 4. Commit Rules
We enforce semantic commit messages:
- `feat: Added new automation trigger`
- `fix: Resolved memory leak in node editor`
- `docs: Updated API documentation`
- `chore: Bumped dependencies`
