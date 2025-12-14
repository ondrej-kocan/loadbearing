Loadbearing — Project Context

Goal
Loadbearing is a homeowner-focused renovation planning web app.
It manages:
	•	tasks with dependencies,
	•	auto-adjusting timelines (Gantt),
	•	renovation budgets (planned vs actual),
	•	read-only sharing.

Target user
	•	Homeowners managing a single renovation
	•	Non-professional, calm UX
	•	Plain language (“blocked by”, not PM jargon)

Current Implementation Status

Implemented Features:
	1.	Project management (single project)
	2.	Task CRUD with inline editing
	3.	Task dependencies (finish-to-start, cycle detection)
	4.	Auto-scheduled timeline (forward scheduling algorithm)
	5.	Budget tracking by area with inline editing
	6.	Budget summaries (planned vs actual)

Next Priority Features:
	1.	Task status tracking (not started, in progress, completed)
	2.	Gantt chart visualization
	3.	Date picker for project start date
	4.	Task filtering and sorting
	5.	Export functionality (CSV/PDF)
	6.	Read-only share links (lower priority)

Design principles
	•	Single project mindset
	•	Dependencies first
	•	Auto > manual
	•	Stress-reducing UI

Chosen name
	•	Project / repo name: loadbearing

Recommended architecture
	•	Single app monolith
	•	Next.js + TypeScript
	•	Postgres + Prisma
	•	Domain logic isolated in /packages/core

Key domain concepts
	•	Task
	•	TaskDependency
	•	BudgetItem
	•	Scheduling engine (detect cycles, forward scheduling)