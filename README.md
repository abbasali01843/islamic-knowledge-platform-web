# Islamic Knowledge Platform — Web

**Learn • Practice • Live Islam**

The dedicated Web/PWA edition of Islamic Knowledge Platform.

## Current status — Release Candidate

The current `main` branch has passed the production CI gate through the latest SEO/performance documentation milestone.

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
- Accessibility/navigation pass: ✅
- Performance optimization pass: ✅
- Basic crawler/Open Graph metadata: ✅

**Latest verified commit:** `92542ac8b9d35f8479612b9cbd2706ce711851a1`

Production deployment and real-device QA are still pending.

## Product principles

- Online-only Islamic content; no localStorage, sessionStorage, IndexedDB or service-worker content cache.
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
- Qibla: GPS bearing + device orientation with iOS/browser handling.
- Hadith: online API loading, grading, search/filtering, Nawawi 40 and books views.
- Dua: online Hisnul Muslim content, categories, search and session-only Tasbeeh.
- Zakat: online Nisab data with Hanafi-oriented calculation flow.
- Hijri Calendar: online AlAdhan calendar with location-aware month handling.
- Salah/Wudu, Ramadan, Hajj, Seerah and Quiz learning modules.
- Global Islamic Search across platform modules and Quran metadata.
- Light/dark mode and PWA install guidance.

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

1. Deploy the `main` branch to a production host.
2. Run Android Chrome/PWA real-device QA.
3. Test GPS, prayer times, Qibla, APIs, deep links, install flow and offline/error states.
4. Fix any production QA findings.
5. Continue with route-level code splitting and full-content Islamic search.
6. Add optional account/cloud sync only after the public web experience is stable.

## Repository split

Android development lives in the main Android repository:
- https://github.com/abbasali01843/islamic-knowledge-platform

This repository is the dedicated Web/PWA codebase.
