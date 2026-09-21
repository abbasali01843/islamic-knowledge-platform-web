# Architecture

## Overview

Islamic Knowledge Platform is a client-rendered React SPA packaged as a PWA. Vite produces the production bundle and Vercel serves the static application.

## Application shell

`src/App.tsx` owns:
- top-level route state
- browser History API navigation
- `popstate` handling
- global search
- theme state
- online/offline indicator state
- lazy loading of major screens

The application uses `window.history.pushState` for internal navigation and maps pathname values to feature screens.

## UI layers

- `src/components/Navbar.tsx` — primary navigation
- `src/components/SectionHeader.tsx` — shared section heading pattern
- feature folders under `src/components/` — screen-specific UI
- `src/index.css` — design tokens, typography, focus and motion behavior

The redesign uses CSS custom properties such as `--ikp-primary`, `--ikp-surface`, `--ikp-text` and `--ikp-focus`.

## Data/service layer

Live services are separated from presentation components.

- `src/services/prayerTimesApi.ts`
- `src/services/hijriCalendarApi.ts`
- `src/services/duaApi.ts`
- `src/services/hadithApi.ts`
- `src/data/quranRepository.ts`

Network requests include timeout/cancellation protection where implemented by the service. Dua detail loading is concurrency-limited. Hadith loading has upstream fallback candidates.

## Quran

Quran catalog metadata is available locally through the repository/catalog layer, while the reader preserves its configured live request behavior and timeout protection.

## Prayer/Qibla

Prayer calculation utilities live in `src/utils/prayerCalculation.ts`. The regression suite verifies:
- exported calculation functions
- Chattogram Qibla bearing range
- Chattogram-to-Kaaba distance range
- Kaaba exact-coordinate behavior
- Hanafi Asr distinction
- Umm al-Qura Isha rule
- location timezone use

Qibla UI combines calculated bearing with device orientation when available and provides a manual mode for testing/desktop use.

## Storage

Local browser storage is used for user-facing preferences/features such as bookmarks and reading/tasbeeh state where implemented. Islamic content is not documented as a durable offline content cache.

## Testing

Two repository scripts form the lightweight release regression layer:

- `scripts/smoke-test.mjs`
- `scripts/prayer-regression.mjs`

The smoke test currently checks required files, timeout/cancellation guards, PWA manifest, accessibility markers, route registration and production dist output.

## Deployment

Vercel serves the production Vite build. `vercel.json` contains the SPA fallback configuration needed for client-side routes.
