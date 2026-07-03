# Bellboard — Client

React frontend for **Bellboard**, a campus events, clubs, and organisations platform. Built by **Team Persey** for AIBEST.

This is the client half of a two-repo system — the API lives in [`aibest-persey-service`](../aibest-persey-service), which is also where the full technical documentation lives (architecture, API reference, data model, setup instructions).

## Stack

- React 19 + Vite
- React Router 7
- React Context for auth/session state (`src/store/AuthContext.jsx`)
- `qrcode.react` for rendering event ticket QR codes
- `i18next` / `react-i18next` for localisation (English + Bulgarian, see `src/i18n/`)
- [Capacitor](https://capacitorjs.com/) wraps the same build as native Android/iOS apps — there is no separate mobile codebase

## Running locally

```sh
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:3000` (see `vite.config.js`), so the API from `aibest-persey-service` must be running on port 3000 for the app to work. See [`../aibest-persey-service/docs/SETUP.md`](../aibest-persey-service/docs/SETUP.md) for full local setup of both repos.

## API client and environment config

All network calls go through the one client in `src/services/apiClient.js`, used by both the web and mobile builds — every `services/*Service.js` file is built on it, and nothing calls `fetch` directly. It resolves its base URL from `VITE_API_URL`, which Vite sets per build mode from these files:

| Mode | File | `VITE_API_URL` | Why |
|---|---|---|---|
| `development` (`npm run dev`) | `.env.development` | *(empty)* | requests are relative and go through the dev-server proxy above |
| `production` (`npm run build`) | `.env.production` | *(empty)* | `aibest-persey-service` serves the built client from the same origin as the API in production, so relative requests still resolve — see its `docs/SETUP.md` |
| `mobile` (`npm run build:mobile`) | `.env.mobile` | absolute URL of the deployed API | a packaged native app has no dev proxy and no shared origin, so it always needs a real URL |

`.env.mobile` ships with a placeholder (`https://api.bellboard.example.com`) — point it at your real deployment before shipping a build. For local device/emulator testing against a machine on your LAN, override it in a git-ignored `.env.mobile.local` instead of editing the checked-in file, e.g. `VITE_API_URL=http://192.168.1.23:3000`.

If a native build ever ends up with an empty `VITE_API_URL`, `apiClient.js` throws immediately on startup rather than silently making requests that can't resolve.

## Building for web

```sh
npm run build:web   # same as `npm run build` — production build to dist/
npm run preview      # preview the production build locally
```

## Building for mobile (Android / iOS)

The native `android/` and `ios/` projects are Capacitor shells around the same `dist/` build — install/config changes go in this repo, not in the native projects.

```sh
npm run build:mobile   # builds with the mobile env config, then syncs dist/ into android/ and ios/
npm run cap:android    # opens the Android project in Android Studio
npm run cap:ios        # opens the iOS project in Xcode (macOS only)
```

From there, run/debug the app using Android Studio's or Xcode's own run button. `npm run cap:sync` re-copies `dist/` and updates native plugins without reopening the IDE — run it after any `build:mobile` if the IDE is already open.

Requires the platform SDKs to actually build/run: [Android Studio](https://developer.android.com/studio) for Android, Xcode (macOS only) for iOS. See the [Capacitor environment setup guide](https://capacitorjs.com/docs/getting-started/environment-setup) if either isn't installed yet.

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
| `npm run lint` | ESLint |
| `npm run cap:sync` | copy `dist/` and update native plugins in `android/`/`ios/` without a full rebuild |

## Full documentation

See [`aibest-persey-service/docs/README.md`](../aibest-persey-service/docs/README.md) for architecture, the full API reference, data model, and setup guide covering both repos.
