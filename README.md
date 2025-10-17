# Campus Life Planner

**Theme:** Campus Life Planner  
**Author / GitHub:** honore-lab

## What it is
A small responsive, accessible single-page app to track campus tasks/events (title, due date, duration in minutes, tag, notes). Built with vanilla HTML/CSS/JS (ES modules).

Features:
- Add / Edit / Delete records
- Regex-powered live search (safe compile)
- Sorting by date/title/duration
- Stats dashboard: total items, sum duration, top tag, last-7-days trend
- Weekly cap (settings) with ARIA live messages
- Import / Export JSON with validation
- localStorage persistence
- Mobile-first responsive design (360px, 768px, 1024px)
- Accessibility (skip link, visible focus, aria-live, keyboard operable)

## File list
See project root for `index.html`, `styles/styles.css`, `scripts/*.js`, `seed.json`, `tests.html`.

## Regex catalog (used)
- Title validation: `^\S(?:.*\S)?$` — no leading/trailing spaces.
- Duration: `^(0|[1-9]\d*)(\.\d{1,2})?$` — integers or decimals to 2 places.
- Date: `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` — YYYY-MM-DD.
- Tag: `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` — letters, spaces, hyphens.
- Advanced: duplicate adjacent words `\b(\w+)\s+\1\b` — warns on titles like "test test".
- Live search: user-supplied regex compiled with try/catch.

## Keyboard map
- Tab / Shift+Tab to navigate interactive controls.
- Enter on record card opens Edit button focusable controls.
- Save/Export/Import via keyboard accessible buttons.

 demo video : https://youtu.be/oXFTVgEpCeM
## How to run locally
1. Clone the repo and open in VS Code or any editor:
```bash
git clone https://github.com/honore-lab/campus-life-planner.git
cd campus-life-planner
code .

 
