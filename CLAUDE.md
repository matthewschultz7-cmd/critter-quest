# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step. Open `index.html` directly in a browser. All data is stored in `localStorage` under the key `critterquest_v2`.

To reset all data: `localStorage.removeItem('critterquest_v2')` in the browser console.

## Architecture

Pure HTML + CSS + JS — no frameworks, no bundler, no dependencies except Google Fonts.

**File responsibilities:**
- `index.html` — Static shell: all screen `<div>`s + header + modal overlay. Scripts loaded at bottom.
- `data.js` — Data layer only. Loads first. Exports global functions and constants (CARD_CATALOG, MASCOT_POOLS, RARITY_COLORS).
- `app.js` — All UI logic. Loads second. Depends on `data.js` globals. Exports global functions consumed by inline `onclick` handlers.
- `style.css` — All styles. CSS custom properties `--accent` and `--accent-light` are set dynamically by `applyTheme()`.
- `script.js` — Old file, no longer loaded. Ignore it.

**Routing:** `nav(screenId, data)` in `app.js` is the router. It shows/hides `.screen` divs, calls the matching `render*` function, and manages header visibility. All inter-screen navigation goes through `nav()`.

**State:** Game session state lives in the `G` object (global in `app.js`). Profile/coin/card state lives in `localStorage` via `data.js` functions. There is no in-memory cache — every data function calls `dbLoad()` (reads localStorage) and `dbSave(db)` (writes localStorage).

**Event handling:** Static header buttons are wired with `addEventListener` once at page load. Dynamic screen content uses inline `onclick="functionName()"` — these functions must be globally scoped.

**Modal pattern:** `showModal(html)` / `closeModal()` — a single shared overlay (`#modal-overlay` / `#modal-box`). Used for confirmations, PIN prompts, and theme switcher.

## Key Conventions

- `esc(str)` must wrap all user-supplied strings rendered into innerHTML to prevent XSS.
- `applyTheme(themeKey, opKey)` sets the body background gradient and CSS accent variables. Call it whenever the visible theme or operation changes.
- `renderHeader()` refreshes the sticky header. Call it after any coin/flair/theme change when a screen with the header is visible.
- Card rarity weights (in `drawCard`): 60% common, 25% uncommon, 10% rare, 4% epic, 1% legendary.
- Parent PIN default: `1234`. Stored in `db.parentPin`.

## Screens Reference

| Screen ID | Render function | Header shown |
|---|---|---|
| `profiles` | `renderProfiles()` | No |
| `profile-form` | `renderProfileForm(data)` | No |
| `dashboard` | `renderDashboard()` | Yes |
| `quest-select` | `renderQuestSelect()` | Yes |
| `quest-game` | `initQuestGame(data)` | Yes |
| `quest-done` | `renderQuestDone(data)` | Yes |
| `inventory` | `renderInventory()` | Yes |
| `bank` | `renderBank()` | Yes |
| `store` | `renderStore()` | Yes |
| `store-admin` | `renderStoreAdmin(data)` | Yes |
| `themes` | `renderThemes()` | Yes |
| `journey` | `renderJourney()` | Yes |

## Data Model Quick Reference

```
db = {
  profiles: Profile[],
  store: StoreItem[],
  parentPin: string,
  activeProfileId: string | null
}

Profile = {
  id, name, grade ('kindergarten'|'grade3'), theme,
  themeCreatures: { forest, ocean, farm, jungle, arctic },  // one emoji per theme
  coins, flair: [cardId|null, cardId|null, cardId|null],
  inventory: Card[], transactions: Transaction[],
  stats: { totalCorrect, totalAttempted, sessionsCompleted, bestStreak },
  sessions: SessionLog[], journeys: { [theme]: { chapter, stopsCompleted } }
}
```

## Grade Configs

- **Kindergarten:** addition (sum ≤ 10), subtraction (diff ≥ 0). No multiply/divide tabs.
- **3rd Grade:** addition (10–500), subtraction (20–999), multiplication (1–12 × 1–12), division (whole number quotients).

## Operation Accent Colors

| Op | Color |
|---|---|
| Addition | `#22C55E` (green) |
| Subtraction | `#3B82F6` (blue) |
| Multiplication | `#F97316` (orange) |
| Division | `#A855F7` (purple) |
| Mixed | `#EC4899` (pink) |
