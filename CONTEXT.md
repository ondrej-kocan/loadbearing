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

MVP scope
	1.	Project
	2.	Tasks with dependencies (finish-to-start only)
	3.	Auto-scheduled timeline
	4.	Budget tracking by area
	5.	Read-only share link

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