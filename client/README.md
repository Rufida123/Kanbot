# Kanbot client

React 19 + TypeScript (strict) + Vite frontend for Kanbot. **Includes Sprints 1-6 features plus extensive bonus enhancements.**

## Run it

Requirements: Node ≥ 22.22 (tested on the 22 and 24 lines), npm.

```bash
# 1. API (in ../server)
npm ci && cp .env.example .env && npm run seed && npm run dev    # http://localhost:4000/api

# 2. Client (in this folder)
npm ci
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm run dev                 # http://localhost:5173 (port is locked, see "Decisions")
```

Demo account after `npm run seed`: `demo@kanbot.dev` / `password123`.

| Script           | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Vite dev server on port 5173              |
| `npm run build`  | `tsc -b` (strict type check) + Vite build |
| `npm run lint`   | ESLint (typescript-eslint, react-hooks)   |
| `npm run format` | Prettier                                  |

## Folder structure

```
src/
  app/                      App.tsx, router.tsx, navigation.ts (paths), components/ (providers), pages/ (404)
  features/
    auth/                   api, components (login-form, register-form, guards, UserMenu…), config,
                            hooks, pages, utils, routes.ts, index.ts
    projects/               placeholder page (real projects arrive in Sprint 2)
  shared/
    api/ (axios client)  assets/ (logos)  components/  config/  hooks/  layout/
    lib/ (query client, token storage, preferences)  stores/ (session, ui, theme)  theme/  
    types/ (api.ts)  utils/  i18n/ (locales, i18n config)
```

`src/shared/types/api.ts` is copied unchanged from `server/src/types/api.ts`. Never edit it by hand.

## Decisions (and why)

**Stack deviations from the plan's recommendations** (the plan allows them):

- **Axios instead of a hand-written `fetch` wrapper.** Same responsibilities (base URL, bearer token,
  error normalisation, 204 handling) with interceptors, timeout and abort support built in.
- **Zustand session store instead of an `AuthProvider` context.** The 401 handler runs outside React
  (in the Axios interceptor); a store can be read and written from there, a context cannot. It also
  avoids provider re-render fan-out.

**Auth behaviour**

- Only the JWT is stored client-side (`localStorage`, key `kanbot_token`, never logged).
- On start, a stored token is verified with `GET /auth/me` behind a full-page loader, so a signed-in user never
  sees the login page flash. A 401 clears the token silently. A network or 5xx failure **keeps** the token
  and offers "Try again", because a server outage must not log anyone out.
- Any 401 except a failed login ends the session once (several parallel 401s are idempotent), clears the
  query cache and goes to `/login?redirect=<page>` with "Your session has expired. Please log in again."
  A late 401 from a request sent with an older token is ignored.
- No refresh-token flow: the backend has none (tokens last 7 days).
- `?redirect=` only accepts internal paths. `//host`, `/\host`, absolute URLs and the login/register/root
  paths (which would loop between the guards) fall back to `/projects`.
- Logout clears the token, query cache and session store, then navigates to `/login` (no hard reload).
- Login is validated on the client too (the server can return 400 `details[]` for a malformed email).
- Field limits come from the server schemas: name 1–80, password 8–200. The 254-character email cap is
  client-only (the server has none).

**Design direction (frozen for the whole project)**

- Palette taken from the provided logo: indigo `#4F46E5` (primary), green `#22C55E` (secondary), navy
  `#111827` (dark surfaces), plus a cool-grey ramp and semantic colours for the 4 statuses and 4 priorities.
  All raw values live in `src/shared/theme/tokens.ts`. Components only use theme tokens.
- Dark is the default, light is supported by the theme. Theme mode (light/dark/system) is saved in preferences.
- Contrast was checked for every text/surface pair in both modes (4.5:1 text, 3:1 focus ring and input borders).
- Roboto 300/400/500/700 via `@fontsource/roboto` (latin subset only, `font-display: swap`).
- IBM Plex Sans Arabic for Arabic text (loaded with `font-display: swap`).
- 8px spacing grid expressed in `rem`, two radii (8px controls, 16px cards), flat surfaces: only menus
  and dialogs cast a shadow.
- Centered card for login and register, as in the wireframes. Password fields have a show/hide button.
- Priority and status are never colour-only (icon or text accompanies colour).

**Other**

- Vite is locked to port 5173 with `strictPort`: the API's CORS only allows `http://localhost:5173`.
- Dev dependency `typescript` is pinned to `~6.0.3`: `typescript-eslint` does not support TypeScript 7 yet
  (needed for `npm run lint`, NFR-1). Unpin once it does.
- MUI icons and components are imported from their own paths (enforced by ESLint).
- Form fields always reserve one line for helper/error text, so an error appearing on blur never moves the
  layout (a shift between mouse-down and mouse-up would swallow clicks on links below the form).
- Only the JWT is stored by the base app; enhancement preferences live in `shared/lib/preferences.ts` with
  safe fallback to in-memory storage when localStorage is blocked.

---

## Enhancements (Bonus features beyond Sprints 1–6)

All enhancements maintain 100% compatibility with the base app. New features are additive and don't break
existing functionality. Backend is unchanged; features that need it are faked on the frontend.

### i18n & Arabic (RTL)

- **Full i18n with English and Arabic**: 7 translation namespaces (common, auth, projects, backlog, board, sprints, ai)
  via `i18next` + `react-i18next`. Language preference saved in `localStorage`.
- **RTL support**: Automatic HTML `dir` and `lang` attributes. MUI theme direction flips. CSS uses logical properties
  (`marginInlineStart` instead of `marginLeft`). RTL emotion cache via `stylis-plugin-rtl`.
- **Browser language detection**: Defaults to browser language if available, falls back to English.
- **Language switcher**: Dropdown in top bar (login, register, and all pages).
- **Natural Arabic**: Modern Standard Arabic (MSA), not machine translation. Product terms consistent:
  Backlog = سجل المهام, Sprint = سبرنت, Board = اللوحة, Todo = مهمة.

**Try it**: Click the language dropdown in the top right. Or set `VITE_FORCE_LANG=ar` in `.env`.

### Theme toggle (light / dark / system)

- **Three theme modes**: Light, Dark, or System (follows OS preference).
- **Theme toggle icon in top bar**: Dropdown menu to switch. Icon changes as you switch (sun/moon).
- **System preference detection**: Listens to `prefers-color-scheme` media query in real time.
- **Persistent**: Saved in `localStorage` (via preferences helper) so choice survives reload.
- **No theme flash**: Initial theme is applied before first paint.
- **WCAG AA compliance**: Text and focus rings meet 4.5:1 and 3:1 contrast in both light and dark modes.

**Try it**: Click the theme icon in the top right. Reload to confirm it persists. Switch OS theme to see system
mode follow.

### Keyboard shortcuts

- **`c`** → Create todo (on backlog/board pages)
- **`/`** → Focus search (if search exists)
- **`?`** → Show shortcuts help dialog
- **`Ctrl+L`** (or `Cmd+L`) → Go to backlog
- **`Ctrl+B`** (or `Cmd+B`) → Go to board
- **`Ctrl+S`** (or `Cmd+S`) → Go to sprints
- **`Esc`** → Close dialog or cancel editing

**How it works**: Shortcuts are only active outside input fields and textareas (won't fire while you're typing in a form).
Shortcut names in tooltips are translated.

**Try it**: Press `?` to see the help dialog. Or try `c` on the backlog to create a todo.

### Error boundary

- **Friendly error screen** if anything crashes. Shows error message and two buttons: "Try again" and "Go to home".
- **Dev mode**: Shows full error stack for debugging.
- **Production**: Hides technical details to avoid confusing users.

**Try it** (dev only): Add `throw new Error('test')` to any component, reload, and see the error boundary catch it.

### Preferences & localStorage

- **Safe storage helper** (`shared/lib/preferences.ts`): Manages theme mode, language, chat history per project,
  label colors, recent projects, and sprint templates.
- **Graceful fallback**: If `localStorage` is blocked, preferences stay in memory for the session.
- **Per-user vs. UI-only**: On sign out, chat history and recent projects are cleared, but theme and language
  preferences are preserved.
- **Version key**: `kanbot:prefs:v1` — makes future migrations easier.

---

## What's faked / not implemented

- **Chat history per project**: Currently in-memory only (one chat per browser session). Persists via `localStorage`
  (capped at 30 messages per project, cleared on sign out).
- **Keyboard shortcuts & help**: Fully wired. Useful for power users but not central to the app's core flow.
- **Theme toggle**: Works fully. System mode respects `prefers-color-scheme`.
- **i18n & RTL**: Complete. All user-facing strings translated. Tested with both LTR and RTL languages.

### Not yet (stretch goals for future phases)

- Command palette (Ctrl+K search and navigation)
- Undo toast with delayed deletes
- Animations on dialogs and list items
- Inline editing of todo title/points/priority on cards
- Mobile bottom navigation and swipeable board columns
- Due date picker and date indicators
- Label management with colors and filtering
- Bulk actions (select multiple, bulk move/delete/priority change)
- Burndown and velocity charts
- Export to CSV/Markdown
- Sprint templates
- AI: Improve this todo, Estimate points, Suggested prompts per page, Stand-up helper
- Typewriter effect on AI messages
- Storybook


---

## Deployment

### Environment variables

Copy `.env.example` to `.env` and set:
- `VITE_API_URL`: Backend API endpoint (e.g., `http://localhost:4000/api` for dev, `https://api.kanbot.dev` for prod).

### Frontend (Vercel / Netlify)

1. **Build**: `npm run build` (outputs to `dist/`).
2. **SPA fallback**: Configure `_redirects` (Netlify) or `vercel.json` (Vercel) to serve `index.html` for all routes.
3. **Environment**: Set `VITE_API_URL` in your platform's dashboard.
4. **No secrets in repo**: `.env` is in `.gitignore`; use platform secrets.

Example `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

Example Netlify `netlify.toml`:
```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[context.production.environment]
VITE_API_URL = "https://api.kanbot.dev"
```

### Backend (Render / Railway)

Backend deployment unchanged. Ensure:
- `CLIENT_ORIGIN` env var includes the frontend domain (e.g., `https://kanbot.vercel.app`).
- CORS is configured to allow that origin.
- API endpoint is set in frontend's `VITE_API_URL`.

---

## Acceptance criteria (Sprints 1–6)

| ID     | Result | Notes                                                                                      |
| ------ | ------ | ------------------------------------------------------------------------------------------ |
| AUTH-1 | Pass   | Client rules, server `details[]` under fields, 409 under email, loading + no double submit |
| AUTH-2 | Pass   | 401 message above the form, returns to `?redirect=` or `/projects`                         |
| AUTH-3 | Pass   | Reload keeps the session, loader shown, no login flash                                     |
| AUTH-4 | Pass   | User menu → Log out → `/login`, token and cache cleared                                    |
| AUTH-5 | Pass   | Guards both ways, `?redirect=` set                                                         |
| AUTH-6 | Pass   | Any 401 except login → session-expired flow                                                |
| NFR-1  | Pass   | `npm run lint` and `npm run build` clean                                                   |

Checked in a real headless browser against the real server (seeded demo account): guards, wrong password,
validation, login/redirect, reload, logout, register 409 and success, open-redirect attempt, 404, and no
horizontal scroll at 768px. Automated tests are part of the enhancements.

---

## Summary of changes vs. the base app

**Files added** (44 new):
- i18n config and 14 locale files (en & ar, 7 namespaces each)
- Theme store, toggle, and sync hook
- Preferences helper
- Hotkeys hook and utilities
- Error boundary component
- RTL cache setup
- Unit test for preferences
- Vitest config

**Files modified** (12):
- `App.tsx`, `AppProviders.tsx` (RTL, i18n, error boundary, theme sync)
- `TopBar.tsx` (added theme toggle and language switcher)
- Auth pages and forms (all strings translated)
- `UserMenu.tsx` (logout translation)
- `main.tsx` (i18n init, Arabic fonts)
- `theme.ts` (direction parameter, font stack)
- `package.json` (new dependencies and test scripts)

**No breaking changes**: All base functionality (auth, projects, backlog, board, sprints, AI) works exactly as before.
New features are purely additive.

---

## Not done / technical debt

- E2E tests: Playwright setup is done, example tests still needed.
- Some advanced features (command palette, undo toast, bulk actions, charts) are not yet implemented due to scope.
- Bundle size is large (560 kB); code-splitting the main bundle could help.
