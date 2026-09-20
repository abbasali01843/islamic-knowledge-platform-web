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
- Performance pass: reduced unnecessary global-search candidate work.
- SEO pass: Bengali metadata, robots directive, Open Graph type and locale metadata.
- CI workflow verified with TypeScript check, production build and artifact upload.

### Release verification
- Latest verified CI commit: `92542ac8b9d35f8479612b9cbd2706ce711851a1`
- Latest CI result: **SUCCESS**
- Production deployment: **pending**
- Real-device production QA: **pending**

## Next
1. Production deployment.
2. Android Chrome/PWA real-device QA.
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
