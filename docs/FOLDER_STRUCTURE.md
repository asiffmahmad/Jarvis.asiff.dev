# Folder Structure

The JARVIS repository is organized via a **Feature-First Architecture** nestled within the standard Next.js App Router structure.

```text
├── src/
│   ├── app/                    # Next.js Routes & Pages (The Shell)
│   │   ├── (auth)/             # Login/Logout flows
│   │   ├── api/                # Route Handlers
│   │   ├── automation/         # Feature 14 Route
│   │   ├── settings/           # Feature 18 Route
│   │   ├── globals.css         # Tailwind directives & CSS Variables
│   │   └── layout.tsx          # Root HTML/Body
│   │
│   ├── components/             # React UI Code
│   │   ├── ui/                 # Reusable Radix/Tailwind primitives
│   │   ├── layout/             # Global Nav, Sidebar, Header
│   │   ├── automation/         # Feature 14 UI Components
│   │   └── settings/           # Feature 18 UI Components
│   │
│   ├── lib/                    # Business Logic, Hooks, Services
│   │   ├── db/                 # Prisma client & Repositories
│   │   ├── settings/           # Settings Service & Hooks
│   │   └── utils.ts            # Global utilities (cn, styling)
│   │
├── prisma/                     # Database Foundation
│   ├── schema.prisma           # Data Model
│   └── seed.ts                 # Default mock data
│
├── docs/                       # Comprehensive System Documentation
│
├── dna/                        # Design guidelines and aesthetic mandates
│
└── public/                     # Static assets (fonts, icons)
```

## Guiding Principles
- **No Orphaned Files:** Every file must belong to a feature or the core `ui`/`lib`.
- **Vertical Slices:** A feature (like Settings) should keep its React UI in `components/settings` and its business logic in `lib/settings`.
- **API Isolation:** Server-side mutations should be constrained to `app/api` or Server Actions, while the UI remains strictly presentation-focused.
