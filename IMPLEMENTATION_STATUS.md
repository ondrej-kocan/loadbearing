# Implementation Status

Track progress on Loadbearing features to ensure nothing is lost.

---

## ✅ Completed Features

### Phase 1 & 2: Navigation System
- **Status**: ✅ Merged
- **What**: Responsive navigation (mobile bottom nav + desktop sidebar)
- **Branch**: `claude/phase2-responsive-nav-90c2o`
- **Details**:
  - Icon-only bottom navigation for mobile portrait
  - Fixed sidebar with project name for desktop/landscape
  - Responsive breakpoints at 640px (sm)

### Task List UX Improvements
- **Status**: ✅ Merged
- **Branch**: `claude/task-list-ux-improvements-90c2o`
- **What**:
  1. Quick status toggle - click status pills to cycle through states
  2. Visual dependency indicators - lock icon for blocked tasks, "Blocks X" badge
  3. Grouped by status - collapsible sections (In Progress, Not Started, Completed)
- **Follow-up fix**: Lock icon only shows for incomplete dependencies

### Dashboard Improvements
- **Status**: ✅ Merged
- **Branch**: `claude/dashboard-improvements-90c2o`
- **What**:
  1. Task status breakdown - progress bar + counts for each status
  2. "Ready to Start" section - shows up to 5 tasks with no blockers
- **Impact**: Dashboard now answers "What is the state of my renovation?"

### Priority 1: Dependency-Driven Timeline Behavior
- **Status**: ✅ Completed
- **Branch**: `claude/dependency-timeline-behavior-90c2o`
- **Goal**: Make dependencies meaningful - show consequences of changes
- **Implemented Features**:
  1. ✅ **Timeline shift tracking**
     - Database fields: `originalStartDate`, `originalEndDate`, `shiftDays`, `shiftCause`
     - Enhanced scheduling service detects and tracks timeline shifts
     - Identifies which dependency caused each shift

  2. ✅ **Visual timeline shift indicators**
     - Yellow badges in TaskList showing "+X days due to changes"
     - Appears on tasks that shifted from original schedule
     - Clear, non-intrusive visual feedback

  3. ✅ **Edit warnings for impactful changes**
     - Real-time impact calculation when editing task duration
     - Shows: "Changing duration will affect X tasks, maximum delay: Y days"
     - Lists specific affected tasks (up to 5) with shift amounts
     - Debounced API calls (500ms) for smooth UX

  4. ✅ **Dashboard timeline causality**
     - Timeline card shows original vs current completion dates
     - Visual indicators: yellow for delays, green for ahead of schedule
     - "Timeline Changes" section lists shifted tasks
     - Helps users understand timeline impacts at a glance

- **Technical Implementation**:
  - [x] Database schema updates for timeline tracking ✅
  - [x] Enhanced `scheduleForward()` in scheduling service ✅
  - [x] Impact calculation API endpoint (`/api/tasks/[id]/calculate-impact`) ✅
  - [x] TaskEditForm with real-time impact warnings ✅
  - [x] TaskList shift badges ✅
  - [x] Dashboard timeline causality display ✅

- **Notes**:
  - 🚧 Migration required: See SQL in session notes or run `npx prisma migrate dev`
  - Form input bug fixed: Duration field now allows clearing without immediate reset
  - All features follow calm, plain-language UX philosophy

---

## 🚧 In Progress

### Priority 3: Task ↔ Budget Linkage
- **Status**: 🚧 In Progress
- **Branch**: `claude/task-budget-linkage-90c2o`
- **Goal**: Connect actions to budget tracking
- **Implemented Features**:
  - ✅ **Database linkage**: Added optional `taskId` field to BudgetItem model
  - ✅ **Budget form task selection**: Both create and edit forms allow linking to tasks
  - ✅ **Visual task linkage**: Budget list shows "🔗 Linked to: [Task Name]" for linked items
  - ✅ **API support**: Budget POST and PUT endpoints handle taskId field
  - ⏳ **Completion prompt**: Pending - prompt to mark costs as spent when completing tasks

- **Technical Implementation**:
  - [x] Schema: Added `taskId` field to BudgetItem, relation to Task ✅
  - [x] BudgetForm: Fetch tasks, dropdown selector, send taskId to API ✅
  - [x] BudgetEditForm: Fetch tasks, dropdown selector, send taskId to API ✅
  - [x] Budget API: Handle taskId in POST and PUT endpoints ✅
  - [x] Budget GET API: Include task relation in response ✅
  - [x] BudgetList UI: Display linked task name ✅
  - [ ] Task completion prompt: Show linked budget items when marking complete ⏳

- **Notes**:
  - Task linkage is optional - budget items can exist without a linked task
  - OnDelete: SetNull ensures budget items remain if linked task is deleted
  - All forms follow calm, plain-language UX philosophy

---

## 📋 Planned (Not Started)

### Priority 2: Timeline Causality
- **Status**: ✅ Implemented as part of Priority 1
- **Goal**: Timeline shows "end date and why" instead of just "end date"
- **Features**:
  - ✅ Show original vs current projected end date
  - ✅ Display timeline shifts with visual indicators
  - ✅ "Timeline Changes" section showing shifted tasks
- **Note**: This was implemented as part of the Priority 1 dashboard enhancements

### Priority 4: Status-Driven Prompts
- **Goal**: Calm, inline nudges (not notifications)
- **Features**:
  - If task blocked for > X days: "This task has been blocked for 5 days"
  - If spend > planned: "Kitchen is £200 over plan — want to adjust?"
  - Inline only, no push notifications

---

## 🎯 Current Focus

**Priority 1: Dependency-Driven Timeline Behavior** ✅ Complete!

The core "Loadbearing" feature is now implemented. Users can now:
- See how task changes cascade through dependencies
- Get warnings before making impactful edits
- Understand timeline shifts on the dashboard

**Next Up: Priority 2-4 (awaiting user direction)**

---

## Notes

- All features follow "calm, non-professional, plain language" UX philosophy
- Target user: Homeowners managing a single renovation project
- Avoid over-engineering - ship features iteratively
- Each priority builds on the previous to answer:
  - ✅ "What is the state of my renovation?"
  - 🚧 "What happens if something slips or costs more?"
  - 📋 "What should I do about it?"
