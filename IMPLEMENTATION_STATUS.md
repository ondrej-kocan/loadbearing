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

---

## 🚧 In Progress

### Priority 1: Dependency-Driven Timeline Behavior
- **Status**: 🟡 Planning
- **Branch**: TBD
- **Goal**: Make dependencies meaningful - show consequences of changes
- **Planned Features**:
  1. **Auto-reschedule dependent tasks**
     - When a task's duration/dates change → cascade to dependent tasks
     - Trigger existing scheduling engine on updates
     - Track which tasks shifted and by how much

  2. **Visual timeline shift indicators**
     - In task cards: "Moved +3 days due to 'Find architect'"
     - Track original vs current dates
     - Color-code shifted tasks (yellow badge)

  3. **Edit warnings for impactful changes**
     - Before saving: "Changing this will delay 2 tasks"
     - Show which tasks will be affected
     - Calm confirmation, not blocking

  4. **Timeline causality on dashboard**
     - Show original projected end date
     - Show current end date
     - If different: "Delayed by 3 days due to 'Find contractor'"

- **Technical Plan**:
  - [x] Track date changes - store original scheduled dates ✅
  - [x] Enhance scheduling service - detect and report cascading impacts ✅
  - [ ] Update task edit flow - calculate impact before saving, show warning
  - [x] Add shift indicators - UI badges showing moved tasks ✅
  - [ ] Dashboard timeline context - show delay causes

- **Implementation Approach**: Core rescheduling → visual indicators → warnings

- **Progress Update**:
  - ✅ Added database fields: `originalStartDate`, `originalEndDate`, `shiftDays`, `shiftCause`
  - ✅ Enhanced `scheduleForward()` to detect shifts and track causes
  - ✅ Added yellow badge in TaskList showing shift amount (e.g., "+3 days due to changes")
  - 🚧 Migration pending: Run `npx prisma migrate dev --name add_timeline_shift_tracking`
  - ⏳ Next: Edit warnings and dashboard timeline causality

---

## 📋 Planned (Not Started)

### Priority 2: Timeline Causality
- **Goal**: Timeline shows "end date and why" instead of just "end date"
- **Features**:
  - Show original vs current projected end date
  - Display cause of delays: "Delayed due to 'Find contractor' (+2 days)"
  - Simple text block under date on dashboard

### Priority 3: Task ↔ Budget Linkage
- **Goal**: Connect actions to budget tracking
- **Features**:
  - Allow budget items to be optionally linked to tasks
  - When task is completed: prompt "Mark associated costs as spent?"
  - Reduce budget admin friction

### Priority 4: Status-Driven Prompts
- **Goal**: Calm, inline nudges (not notifications)
- **Features**:
  - If task blocked for > X days: "This task has been blocked for 5 days"
  - If spend > planned: "Kitchen is £200 over plan — want to adjust?"
  - Inline only, no push notifications

---

## 🎯 Current Focus

**Priority 1: Dependency-Driven Timeline Behavior**

This is the core "Loadbearing" value proposition - understanding cascading impacts.

Next steps:
1. Start with auto-reschedule + cascade detection
2. Add visual shift indicators
3. Implement edit warnings
4. Add dashboard timeline context

---

## Notes

- All features follow "calm, non-professional, plain language" UX philosophy
- Target user: Homeowners managing a single renovation project
- Avoid over-engineering - ship features iteratively
- Each priority builds on the previous to answer:
  - ✅ "What is the state of my renovation?"
  - 🚧 "What happens if something slips or costs more?"
  - 📋 "What should I do about it?"
