# Bellboard — Client

React frontend for **Bellboard**, a campus events, clubs, and organisations platform. Built by **Team Persey** for AIBEST.

This is the client half of a two-repo system — the API lives in [`aibest-persey-service`](../aibest-persey-service), which is also where the full technical documentation lives (architecture, API reference, data model, setup instructions).

## Stack

- React 19 + Vite
- React Router 7
- React Context for auth/session state (`src/store/AuthContext.jsx`)
- `qrcode.react` for rendering event ticket QR codes

## Running locally

```sh
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:3000` (see `vite.config.js`), so the API from `aibest-persey-service` must be running on port 3000 for the app to work. See [`../aibest-persey-service/docs/SETUP.md`](../aibest-persey-service/docs/SETUP.md) for full local setup of both repos.

## Project structure

```
src/
├── pages/        route-level screens (Home, EventDetails, Schedule, Ticket, Clubs, Inbox, Profile,
│                 OrganiserDashboard, AdminDashboard, auth screens, ...)
├── components/   shared UI (DesktopShell, PhoneFrame, form controls)
├── services/     one file per API domain (authService, eventService, clubService, ...)
├── store/        AuthContext — the only app-wide state
├── hooks/        useAuth, useIsDesktop, useHasOrganisation
└── utils/        tokenStorage, validation, etc.
```

## Other scripts

| Script | Purpose |
|---|---|
| `npm run build` | production build to `dist/` |
| `npm run preview` | preview the production build locally |
| `npm run lint` | ESLint |

## Full documentation

See [`aibest-persey-service/docs/README.md`](../aibest-persey-service/docs/README.md) for architecture, the full API reference, data model, and setup guide covering both repos.
