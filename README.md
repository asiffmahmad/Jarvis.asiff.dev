# JARVIS Operating System

Welcome to **JARVIS**, a production-grade, multi-agent AI Content Automation Operating System. 

JARVIS is engineered to act as a central nervous system for content creators, agencies, and enterprises, orchestrating complex workflows, AI agents, social media management, research aggregation, and knowledge indexing under a unified, high-performance web interface.

---

## 🚀 Features

JARVIS is composed of 18 integrated modules:

1. **Dashboard & Mission Control:** Unified view of system health and metrics.
2. **Library & Content Engine:** Modular content creation workspace.
3. **Studio:** Advanced content editing and layout tools.
4. **Knowledge Hub:** Centralized indexing and vector-ready storage for long-term memory.
5. **Research Hub:** Automated RSS feed parsing, curation, and sentiment analysis.
6. **Prompt Library:** Version-controlled storage for LLM prompts.
7. **Scheduler & Calendar:** Centralized timeline for content and agent execution.
8. **Mail & Comms:** Integrated communications interface.
9. **Analytics:** Business intelligence and metrics tracking.
10. **Automation Builder:** Node-based workflow engine for complex task routing.
11. **Agent Workspace:** Custom AI agent configuration and execution layer.
12. **Platform Manager:** Multi-account social media provider framework.
13. **Integration Hub:** API connections and credential management.
14. **System Settings:** Deep OS-level configuration and administration.
15. **Database Layer:** Robust Prisma ORM foundation for persistent state.

---

## 🏗 Architecture

JARVIS is built on a modern, strictly-typed Next.js foundation:

- **Framework:** Next.js 14+ (App Router, Turbopack)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** TiDB Cloud Serverless (MySQL) via Prisma ORM
- **UI Architecture:** 4-Panel Glassmorphism HUD (JARVIS Design DNA)
- **Component Library:** Radix UI Primitives + Custom implementation
- **State Management:** React Hooks + Singleton Services

For an in-depth breakdown, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠 Installation & Quickstart

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- A MySQL-compatible database (TiDB Cloud recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd "Automation Tool"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env.local` and fill in your credentials.
   See [ENVIRONMENT.md](docs/ENVIRONMENT.md) for details.

4. **Initialize Database**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`.

---

## 📜 Documentation

Extensive documentation is available in the `docs/` directory:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design and patterns.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production Vercel deployment guide.
- [ENVIRONMENT.md](docs/ENVIRONMENT.md) - Environment variable dictionary.
- [DATABASE.md](docs/DATABASE.md) - Database schema and migration strategies.
- [API.md](docs/API.md) - Route handlers and external APIs.
- [COMPONENTS.md](docs/COMPONENTS.md) - Reusable UI library documentation.
- [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) - Repository directory map.
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Workflow, standards, and commit rules.

---

## 📄 License
This project is licensed under the MIT License.
