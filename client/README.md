# Kanbot client

React 19 + TypeScript (strict) + Vite frontend for Kanbot. **Sprint 1: setup, design direction, auth.**

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
    lib/ (query client, token storage)  stores/ (session)  theme/  types/ (api.ts)  utils/
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
- Dark is the default, light is supported by the theme (the toggle arrives in Sprint 7). In dark mode the
  primary is slightly lighter (`#6063EE`) so white button text and the focus ring both stay AA on navy.
- Contrast was checked for every text/surface pair in both modes (4.5:1 text, 3:1 focus ring and input borders).
- Roboto 300/400/500/700 via `@fontsource/roboto` (latin subset only, `font-display: swap`).
- 8px spacing grid expressed in `rem`, two radii (8px controls, 16px cards), flat surfaces: only menus
  and dialogs cast a shadow.
- Centered card for login and register, as in the wireframes. Password fields have a show/hide button.
- Priority and status are never colour-only (icon or text accompanies colour; applied from Sprint 3).

**Other**

- Vite is locked to port 5173 with `strictPort`: the API's CORS only allows `http://localhost:5173`.
- Dev dependency `typescript` is pinned to `~6.0.3`: `typescript-eslint` does not support TypeScript 7 yet
  (needed for `npm run lint`, NFR-1). Unpin once it does.
- MUI icons and components are imported from their own paths (enforced by ESLint).
- Form fields always reserve one line for helper/error text, so an error appearing on blur never moves the
  layout (a shift between mouse-down and mouse-up would swallow clicks on links below the form).
- Theme mode is not persisted: NFR-7 allows only the JWT in client storage. To be revisited in Sprint 7.

## Acceptance criteria (Sprint 1)

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
horizontal scroll at 768px. Automated tests are intentionally not part of this sprint.

## Not done / technical debt

- `/projects` is a placeholder so login has somewhere to land. The real page and app shell are Sprint 2.
- Light theme is defined but not visually reviewed yet (no toggle until Sprint 7).
- No automated tests (by request).
