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

- **Project**: Single renovation project container with start date
- **Task**: Individual tasks with duration, dependencies, and status tracking
  - Includes timeline shift tracking (originalStartDate, originalEndDate, shiftDays, shiftCause)
  - Status: not_started, in_progress, completed
- **TaskDependency**: Finish-to-start dependencies between tasks
- **BudgetItem**: Budget tracking by area (planned vs actual)
  - Optional link to tasks via taskId (enables completion prompts)
- **ShareToken**: Read-only share links (model exists, UI not yet implemented)

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

## Deployment

### Deploy to Vercel

The easiest way to deploy Loadbearing is with Vercel:

1. **Push your code to GitHub** (already done if you're using this repo)

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Vercel Postgres**:
   - In your Vercel project dashboard, go to the "Storage" tab
   - Click "Create Database" → "Postgres"
   - Choose the "Postgres" option
   - Vercel will automatically add `DATABASE_URL` to your environment variables

4. **Push database schema**:
   ```bash
   # After your first deployment, run this locally with production DATABASE_URL:
   npx prisma db push
   ```

   Or use Vercel CLI:
   ```bash
   npm install -g vercel
   vercel env pull .env.local  # Pull production env vars
   npx prisma db push          # Push schema to production DB
   ```

5. **Deploy**:
   - Vercel automatically deploys on every push to your main branch
   - Your app will be live at `https://your-project.vercel.app`

### Alternative: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your terminal
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Make sure these are set in Vercel:
- `DATABASE_URL` - Automatically set when you add Vercel Postgres
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://loadbearing.vercel.app`)

## Current Features

### Implemented

#### Core Project Management
1. **Project Management** - Single renovation project container with start date

#### Task Management
2. **Task CRUD Operations**
   - Create, edit, and delete tasks
   - Custom duration (in days)
   - Task descriptions
   - Inline editing interface

3. **Task Status Tracking**
   - Three states: not started, in progress, completed
   - Quick status toggle - click status pills to cycle through states
   - Grouped by status with collapsible sections
   - Visual indicators for task progress

4. **Task Dependencies**
   - Finish-to-start dependency model
   - Cycle detection (prevents circular dependencies)
   - Auto-scheduling with forward scheduling algorithm
   - Visual indication of blocking tasks (lock icon)
   - "Blocks X tasks" badges showing downstream impact

#### Timeline & Scheduling
5. **Dependency-Driven Timeline Behavior**
   - Auto-scheduled dates for all tasks based on dependencies
   - Timeline shift tracking (shows when tasks move from original schedule)
   - Visual shift indicators: "+X days due to changes"
   - Edit warnings showing impact on dependent tasks
   - Real-time impact calculation with debounced API calls

6. **Dashboard Timeline Causality**
   - Shows original vs current completion dates
   - Visual indicators: yellow for delays, green for ahead of schedule
   - "Timeline Changes" section listing shifted tasks
   - Task status breakdown with progress bar
   - "Ready to Start" section (tasks with no blockers)

#### Budget Management
7. **Budget Tracking**
   - Create, edit, and delete budget items
   - Organized by area (Kitchen, Bathroom, etc.)
   - Planned vs. actual amount tracking
   - Budget summaries and totals
   - Inline editing interface

8. **Task ↔ Budget Linkage**
   - Optional linking of budget items to tasks
   - Visual task linkage in budget list
   - Task completion prompt for updating actual costs
   - Auto-fills actual costs with planned amounts
   - Smart budget updates when completing tasks

#### Navigation & UX
9. **Responsive Navigation**
   - Mobile: Bottom navigation (icon-only)
   - Desktop: Fixed sidebar with project name
   - Responsive breakpoints at 640px

### Planned Features
- **Gantt Chart Visualization** - Visual timeline of tasks and dependencies
- **Status-Driven Prompts** - Inline nudges (e.g., "Task blocked for 5 days")
- **Date Picker** - Calendar UI for project start date
- **Filtering & Sorting** - Advanced task filtering
- **Export Functionality** - Export to CSV/PDF
- **Read-only Share Links** - Share project view with contractors/family