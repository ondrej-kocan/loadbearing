# Claude.md - AI Assistant Guide for Loadbearing

This file contains instructions and context for AI assistants (like Claude) working on the Loadbearing project.

## Project Overview

Loadbearing is a homeowner-focused renovation planning web app that helps manage:
- Tasks with dependencies and auto-scheduling
- Renovation budgets (planned vs actual)
- Project timelines

**Target User**: Homeowners managing a single renovation project
**UX Philosophy**: Calm, non-professional, plain language (no PM jargon)

## Git Workflow & Branching Strategy

### IMPORTANT: Always Create New Branches

**Default behavior**: Create a NEW branch for each task unless explicitly told otherwise.

- Branch naming: `claude/{task-description}-{session-id}`
- Example: `claude/add-status-tracking-90c2o`
- The user merges changes after reviewing your work
- **Only continue on an existing branch if the user explicitly tells you to**
- **If unsure whether to use a new or existing branch, ASK the user**

### Branch Creation Example

```bash
# For a new feature/task:
git checkout -b claude/task-description-{session-id} main
```

### Commit Message Style

Use clear, descriptive commit messages:
```
Add task status tracking functionality

- Add status field to Task model
- Create status dropdown in TaskList
- Update API to handle status updates
```

For fixes:
```
Fix: Add text color to form inputs for visibility
```

### When to Ask About Branching

- If you're making changes related to an open PR
- If you're making a small fix vs. a new feature
- If the task seems like a continuation of previous work
- When in doubt, ask!

## Development Workflow

### Quick Start

```bash
npm install
npx prisma migrate dev
npm run dev
```

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
```

### Database Changes

When modifying schema:
```bash
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

## Code Style & Conventions

### General Principles

1. **Keep it simple** - Avoid over-engineering
2. **No unnecessary abstractions** - Three similar lines > premature abstraction
3. **Plain language** - Use "blocked by" not "predecessor tasks"
4. **Homeowner-friendly** - This is for non-technical users

### TypeScript

- Use TypeScript for all files
- Define interfaces for data structures
- Avoid `any` types when possible
- Use type inference where it's clear

### Components

- Use `'use client'` directive for client components
- Keep components focused and single-purpose
- Use inline editing patterns (see TaskEditForm, BudgetEditForm)
- Disable buttons during async operations

### Styling

- Use Tailwind CSS classes
- Text color: `text-gray-900` for input fields
- Consistent spacing and layout
- Calm, stress-reducing UI

### API Routes

- Follow REST conventions (GET, POST, PUT, DELETE)
- Return proper HTTP status codes
- Use Prisma for all database operations
- Include error handling with try/catch

## Architecture Decisions

### Domain Logic Isolation

Core business logic lives in `/packages/core`:
- `packages/core/src/models/` - Domain models and types
- `packages/core/src/services/` - Business logic (scheduling, etc.)

This keeps domain logic separate from Next.js framework code.

### Scheduling Engine

The scheduling engine (`packages/core/src/services/scheduling.ts`) is critical:
- Uses DFS for cycle detection
- Implements Kahn's algorithm for topological sorting
- Forward scheduling calculates dates based on dependencies
- Don't modify without understanding the algorithm

### Database Schema

- Use Prisma for all database operations
- Cascade deletes where appropriate
- Use CUIDs for IDs (hard to guess)
- See `prisma/schema.prisma` for current schema

## What NOT to Do

### Avoid Over-Engineering

- ❌ Don't add features not explicitly requested
- ❌ Don't create helpers for one-time operations
- ❌ Don't add extensive error handling for impossible scenarios
- ❌ Don't add backwards-compatibility hacks
- ❌ Don't design for hypothetical future requirements
- ✅ Make the minimum changes needed for the current task

### No Proactive Documentation

- ❌ Don't create markdown documentation files unless asked
- ✅ Keep code self-documenting
- ✅ Add comments only where logic isn't self-evident

### Don't Add Unnecessary Validation

- ❌ Don't validate internal code (trust it)
- ✅ Only validate at system boundaries (user input, external APIs)

## Testing Philosophy

**Current approach**: Move fast, skip tests unless explicitly requested

- No unit tests by default
- No integration tests by default
- Focus on shipping features quickly
- Tests may be added later when stabilizing

If the user requests tests, then add comprehensive coverage.

## Development Practices

### When Making Changes

1. **Read before editing** - Always use Read tool on files before modifying
2. **Understand context** - Check related files and imports
3. **Preserve patterns** - Match existing code style
4. **Test locally if possible** - Run build to check for errors

### Common Patterns

**Inline Editing**:
- Show edit form inline when "Edit" button clicked
- Use state to track which item is being edited
- Only one item can be edited at a time
- Provide "Save" and "Cancel" options

**API Calls**:
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async () => {
  setError('');
  setLoading(true);

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to...');
    }

    onSuccess();
  } catch (err) {
    setError(err.message);
    setLoading(false);
  }
};
```

## File Structure

```
loadbearing/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities (Prisma client, etc.)
├── packages/core/         # Domain logic (ISOLATED)
│   └── src/
│       ├── models/        # Domain types
│       └── services/      # Business logic
├── prisma/
│   └── schema.prisma      # Database schema
└── types/                 # Shared TypeScript types
```

## Current State

See `CONTEXT.md` for:
- Implemented features
- Next priority features
- Design principles

See `README.md` for:
- Setup instructions
- Deployment guide
- Feature documentation

## Questions to Ask

If you're unsure about any of these, ask the user:

- Should this be a new branch or continue on existing?
- Should this feature have tests?
- Is this the right level of complexity?
- Should I add validation here?
- Where should this code live (app/ vs packages/core/)?

## Deployment

The app is configured for Vercel deployment with Postgres.

Environment variables needed:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Production URL

## Summary

**Golden Rules**:
1. ✅ Always create a new branch (unless told otherwise)
2. ✅ Keep it simple (avoid over-engineering)
3. ✅ Read files before editing
4. ✅ Match existing patterns
5. ✅ Ask when uncertain
6. ❌ Don't add tests unless requested
7. ❌ Don't create documentation unless requested
8. ❌ Don't over-engineer solutions
