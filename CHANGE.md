# Change Log — Web

All notable Web/PWA changes are tracked here by milestone.

## 2026-09-20 — Web Release Candidate audit

### Completed
- Dedicated Web/PWA repository established and documented.
- Online-only architecture enforced; no browser storage or service-worker Islamic-content cache.
- Centralized browser geolocation and reused granted GPS location for prayer/calendar flows.
- Timezone-safe prayer calculations and AlAdhan API integration with timeout/fallback handling.
- Monthly prayer timetable and location-aware Hijri calendar integration.
- Quran live API reader with source attribution and no bundled Quran text.
- Hadith and Dua live API integrations with request timeouts and normalization fixes.
- Zakat/Nisab online integration.
- Qibla GPS bearing and device-orientation handling, including iOS compass support.
- PWA manifest, install prompt and iOS installation guidance.
- SPA deep-link fallbacks for Vercel/static hosting.
- Global Islamic Search for platform modules and Quran metadata.
- Accessibility/navigation audit: semantic anchor navigation added to primary routes while preserving SPA behavior.
- Accessibility follow-up: labeled Hadith/Quran controls, primary navigation state, and PWA install controls.
- Hadith performance: capped visible rendering and changed API loading to progressive batches to avoid rendering thousands of cards at once.
- Qibla robustness: clearer orientation support checks, secure-context handling and calibration guidance.
- Performance pass: reduced unnecessary global-search candidate work.
- SEO pass: Bengali metadata, robots directive, Open Graph type and locale metadata.
- CI workflow verified with TypeScript check, production build and artifact upload.

### Release verification
- Latest verified CI commit: `92542ac8b9d35f8479612b9cbd2706ce711851a1`
- Latest CI result: **SUCCESS**
- Production deployment: **Vercel verified for latest accessibility commit**
- Real-device production QA: **pending**

## Next
1. Real-device production QA.
2. Verify Android Chrome/PWA, iOS Safari and desktop flows.
3. Verify GPS, prayer calculations, Qibla, live APIs, deep links and PWA install.
4. Fix production QA findings.
5. Route-level code splitting and deeper performance work.
6. Full-content Quran/Hadith/Dua search.
7. Optional account/cloud synchronization.

## Architecture notes
- Current frontend remains Vite + React + TypeScript.
- Targeted refactoring is preferred over a premature framework migration.
- Islamic content remains online-first.
- Religious content governance should follow source → review → attribution → version → publish.

## 2026-09-20 — Latest accessibility/performance follow-up

- `b49ff0e9b2b824dab7ef63a289a344c82914c468` — labeled Hadith action controls.
- `99a3bcab4a02e168e0de707b9b7172faf70c229b` — labeled Quran reader navigation controls.
- `716eb5f537efac504a88d67c79ddf112337429b0` — improved primary navigation semantics.
- `564bf1c6f684f1ebe81b89d7911e1c26829b4693` — improved PWA install prompt accessibility.
- Latest commit has a verified Vercel **SUCCESS** status.
- GitHub Actions status for the latest accessibility commits is not claimed here unless a workflow run is directly verified.
