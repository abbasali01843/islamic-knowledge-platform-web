# Islamic Knowledge Platform — Web

**Learn • Practice • Live Islam**

The dedicated Web/PWA edition of Islamic Knowledge Platform.

## Current status — Release Candidate

The current `main` branch is the active Release Candidate. Core typecheck/build gates were previously verified; the latest accessibility changes have a verified Vercel deployment.

- TypeScript typecheck: ✅
- Production build: ✅
- Web artifact upload: ✅
- Online-only Islamic content architecture: ✅
- PWA manifest/install flow: ✅
- SPA deep-link fallbacks: ✅
- Browser geolocation/prayer integration: ✅
- Qibla compass handling: ✅
- Quran, Hadith, Dua, Zakat and Hijri integrations: ✅
- Global Islamic search: ✅
- Accessibility/navigation pass: ⚠️ implemented; real-device/accessibility-tool verification pending
- Performance optimization pass: ⚠️ implemented; production measurement pending
- Basic crawler/Open Graph metadata: ⚠️ basic metadata only; route-specific metadata/SSR is not implemented

**Latest audited main commit:** `e34f28230c3cb8d3bd124d316d617bb2d200ac2c`  
**Vercel deployment:** ✅ verified for the latest accessibility commit

Production hosting is deployed on Vercel; real-device QA is still pending.

## Product principles

- Online-only Islamic content; no local content cache or service-worker content cache.
- Device preferences and salah tracker use browser `localStorage`; Islamic content is not persisted locally.
- Bengali-first, Arabic-friendly, responsive UI.
- Guest-first experience.
- Source attribution and Hadith grading where available.
- Prayer calculations are location, method and madhab aware.
- Religious content should be reviewed and attributed before publication.
- Mobile and desktop layouts.
- Installable PWA without offline Islamic-content persistence.

## Main features

- Quran: 114-surah catalog, live Arabic/Bengali reader, Juz/page navigation, session/device preferences.
- Prayer: GPS-aware location, calculation methods, madhab, monthly timetable and local fallback.
- Qibla: GPS bearing + device orientation with iOS/browser handling and clearer support/error guidance.
- Hadith: progressive online API loading, grading, search/filtering, Nawawi 40 and books views, with a capped rendered list.
- Dua: online Hisnul Muslim content, categories, search and session-only Tasbeeh.
- Zakat: online Nisab data with Hanafi-oriented calculation flow.
- Hijri Calendar: online AlAdhan calendar with location-aware month handling and timezone-aware date conversion.
- Salah/Wudu, Ramadan, Hajj, Seerah and Quiz learning modules.
- Global Islamic Search across platform modules and Quran metadata.
- Light/dark mode, accessibility labels/navigation semantics and PWA install guidance.

## Online data sources

External services are used for live content/calculation data. The app should show source attribution in relevant screens.

- Al Quran Cloud — Quran data
- AlAdhan — prayer and Hijri calendar services
- Fawaz Ahmed Hadith API — Hadith data
- TheLightHub Hisnul Muslim API — Dua data
- Tahababa Nisab API — Nisab data

Service availability can change; the app uses timeouts and local calculation fallbacks where implemented.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Deployment

The project is a Vite SPA.

- Vercel fallback: `vercel.json`
- Static-host fallback: `public/_redirects`
- HTTPS is required for browser geolocation and device orientation features.
- No production URL is configured in this repository yet.

## Next release steps

1. Run Android Chrome/PWA real-device QA.
2. Test GPS, prayer times, timezone/method/madhab, Qibla, APIs, deep links, install flow and offline/error states.
3. Add automated regression tests for prayer calculations, Hijri timezone boundaries, API parsing and critical UI flows.
4. Fix any production QA findings.
5. Continue with route-level code splitting and full-content Islamic search.
6. Add optional account/cloud sync only after the public web experience is stable.

## Repository split

Android development lives in the main Android repository:
- https://github.com/abbasali01843/islamic-knowledge-platform

This repository is the dedicated Web/PWA codebase.
