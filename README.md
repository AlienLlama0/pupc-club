# Presidency University Programming Club — Website & Executive Dashboard — Frontend Demo

A complete, runnable **frontend-only** demo: public club website + private executive management dashboard, in a dark red theme built on the NRC 2026 reference layout (light pill navigation, cream button, red gradient CTA, bold techno headline).

> **Demo Mode.** All data is sample data stored in your browser's local storage. Logins and permissions are simulated client-side and are **not** a security boundary. Do not enter real personal information or real club finances.

## Run it

Requires Node.js 18+.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run build:single # one self-contained HTML file → dist-single/index.html
```

The app uses hash routing (`/#/dashboard`), so `dist/` works on any static host (Netlify, Vercel, GitHub Pages) without rewrite rules.

## Demo accounts

Quick-login buttons for every account are on the **Login** page (`Account` in the nav).

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@club.demo | Admin123! |
| President | president@club.demo | President123! |
| Moderator | moderator@club.demo | Moderator123! |
| General Secretary | gs@club.demo | GS123456! |
| Treasurer | treasurer@club.demo | Treasurer123! |
| Event Coordinator | events@club.demo | Events123! |
| Competition Lead | lead@club.demo | Lead123456! |
| Executive Member | executive@club.demo | Executive123! |

**Member IDs to test on Verify ID:** `PUPC-2025-014` (active), `PUPC-2023-007` (inactive), `PUPC-0000-000` (not found).

## Things to try

1. **Registration → approval → verification:** submit the Join form, log in as GS, approve it in *Members* (a member ID is generated), then verify that ID on the public site.
2. **Role-based task workflow:** log in as Moderator → *Task Board* → *New task* → pick a role → only executives holding that role are listed (a warning appears if none do). Log in as that executive → *My Tasks* → update progress → *Submit for review*. Log back in as Moderator → *To review* → *Approve* or *Request changes*.
3. **Dynamic roles:** as Super Admin → *Roles & Access* → type a role name and create it, tick its permissions, assign it in *Assign to executives*. Log in as that executive and the sidebar/dashboard updates.
4. **Treasury:** ledger with filters/sort/CSV, budget vs actual, approve pending transactions and reimbursements (any executive can request one from the Overview).
5. **GS workspace:** schedule meetings, record minutes/attendance/decisions, generate follow-up tasks, publish notices, draft letters into the searchable archive.
6. **Reset:** *Settings → Reset demo data* restores everything (Super Admin).

## Project structure

```
src/
  types.ts              Data model (maps 1:1 to future DB tables / API resources)
  data/seed.ts          Realistic, cross-linked sample data (dates are relative to today)
  store/DemoStore.tsx   State + localStorage persistence, mock auth, permission checks, toasts
  lib/taskActions.ts    Task workflow (create, assign, submit, approve, return) + notifications
  lib/util.ts           Dates, currency, CSV export, permission catalogue
  components/           UI kit, public layout, dashboard layout & permission guard
  pages/public/         Home, About, Join, Executives, Events/Gallery, Verify, Contact, Login
  pages/dashboard/      Overview, Tasks, Members, Executives, Events, Treasury, GS, Competitions,
                        Roles, Documents, Notifications, Settings, Search
```

Theme tokens live in `tailwind.config.js` (`navy`, `ice`, `cream`, `pill`, `cyan`, `violet`, `ember`) and `src/index.css` (`.btn-gradient`, `.btn-cream`, `.btn-dark`, `.card`, `.field`). Editable club details (name, logo text, headline, slogan, mission, contacts, social links) are in *Dashboard → Settings* or `src/data/seed.ts`.

## Moving to production

- Replace `DemoStore`'s `update()` calls with API mutations (e.g. React Query) backed by a database.
- Replace `login()` with a real auth provider; remove `password` from `Executive`.
- Enforce every `Permission` on the server — the client `can()` checks are only for UI.
- Move uploads to object storage and notifications to a server-side queue (today they are per-browser only).
- Real event/executive photos: set `photo` on executives and `image` on gallery items.
# pupc-club
