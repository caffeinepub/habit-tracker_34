# Habit Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Habit list view: vertical list of user-defined habits, each with 7 day boxes (Mon-Sun) for the current week
- Tap a day box to toggle completion (tick/untick)
- Automatic week rollover: at the start of each new week, a fresh set of 7 boxes is generated; previous weeks are preserved in history
- Add/remove habits
- Stats view:
  - Daily completion percentage (today's habits done / total)
  - Weekly completion percentage (this week)
  - Monthly completion percentage (this calendar month)
  - Pie chart: completed vs missed habits (current week)
  - Line graph: weekly completion % trend over past weeks
- All data persisted in localStorage (no backend required for data, but Motoko backend scaffolded per platform requirement)
- Dark theme UI, clean and minimal

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Motoko backend: minimal scaffolding (no server-side storage needed; all data in localStorage)
2. Frontend data model:
   - `Habit`: { id, name, createdAt }
   - `WeekRecord`: { weekKey (YYYY-WW), habitId, completions: { mon, tue, wed, thu, fri, sat, sun } }
   - localStorage keys: `habits`, `weekRecords`
   - On app load, detect current week; if no record exists for current week, auto-create fresh records for all habits
3. Pages/views:
   - `HabitsPage`: main view with habit list + weekly day boxes; add/delete habit controls
   - `StatsPage`: daily %, weekly %, monthly %; pie chart; line graph
   - Bottom tab navigation between Habits and Stats
4. Charts: use Recharts (pie chart + line chart)
5. Apply dark theme via Tailwind dark classes and CSS variables
6. All interactive elements get deterministic `data-ocid` markers
