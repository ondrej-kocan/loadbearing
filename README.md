# Loadbearing

A homeowner-focused renovation planning web app that helps manage tasks with dependencies, auto-adjusting timelines, and budgets.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Architecture**: Monorepo with isolated domain logic in `/packages/core`

## Project Structure

```
loadbearing/
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions and clients
│   └── prisma.ts       # Prisma client singleton
├── packages/
│   └── core/           # Domain logic (isolated)
│       └── src/
│           ├── models/     # Domain models
│           └── services/   # Business logic (scheduling, etc.)
├── prisma/
│   └── schema.prisma   # Database schema
└── types/              # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL connection string
```

3. Run database migrations:

```bash
npx prisma migrate dev --name init
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Core Models

- **Project**: Single renovation project container
- **Task**: Individual tasks with duration and dependencies
- **TaskDependency**: Finish-to-start dependencies between tasks
- **BudgetItem**: Budget tracking by area (planned vs actual)
- **ShareToken**: Read-only share links

## Domain Logic

The core domain logic is isolated in `/packages/core`:

- **Scheduling Engine**: Auto-schedules tasks based on dependencies
- **Cycle Detection**: Prevents circular dependencies
- **Forward Scheduling**: Calculates start/end dates with finish-to-start dependencies

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build
```

## MVP Scope

1. Single project management
2. Tasks with finish-to-start dependencies
3. Auto-scheduled timeline (Gantt-style)
4. Budget tracking by area
5. Read-only share links