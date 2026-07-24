# Architecture & System Design

JARVIS is designed as a modular, extensible "Operating System" running on the web. It embraces the principle of Separation of Concerns to ensure long-term maintainability.

## 1. System Architecture

The application is built on **Next.js (App Router)** utilizing a hybrid rendering approach:
- **Server Components (RSC):** Used for initial data fetching and static layout rendering to optimize SEO and TTI (Time to Interactive).
- **Client Components:** Used strictly for interactive UI elements (panels, forms, Framer Motion animations) marked with `"use client"`.

## 2. Core Modules (The 4-Panel Architecture)

The JARVIS UI strictly adheres to the "Design DNA", utilizing a 4-panel architecture across almost all modules:
1. **Left Sidebar:** Navigation and categorizations.
2. **Center Panel:** The primary interactive canvas (forms, grids, node editors).
3. **Right Panel:** Inspector, metadata, and contextual help.
4. **Bottom Toolbar:** Global action triggers (Save, Delete, Sync).

## 3. Data Flow & Repositories

The system enforces a strict **Repository Pattern**.
- **UI Components** dispatch intents via React Hooks (e.g., `useSettings`, `usePrompts`).
- **Services** (e.g., `SettingsService`) handle business logic and formatting.
- **Repositories** (e.g., `SettingsRepository`) handle all `prisma` interactions.

UI Components and Services are strictly forbidden from calling `prisma` directly.

## 4. Authentication Flow

Authentication is managed via Next.js middleware and route handlers, backing into the `User` and `Session` Prisma models.

## 5. Future Extension Points

JARVIS is designed with planned extension points:
- **Vector Storage:** The Knowledge Hub is prepared for future pgvector or Pinecone integration.
- **Multi-Agent Orchestration:** The Agent Workspace is stubbed for LangChain / AI SDK routing.
- **Multi-Tenant / Enterprise:** The schema supports future isolation by abstracting global state into `userId` boundaries.
