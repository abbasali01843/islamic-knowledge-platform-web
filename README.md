# Islamic Knowledge Platform — Web/PWA

**Status:** Release-verified candidate  
**Snapshot:** 2026-09-21  
**Stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4  
**Primary language:** Bengali (বাংলা), with Arabic and English support

Islamic Knowledge Platform is a Bengali-first, online-only Islamic knowledge Web/PWA. The current product combines Quran reading, prayer tools, Qibla, Duas, Hadith, learning modules, Zakat, Hijri calendar, Ramadan, Hajj, Seerah and Quiz experiences in one mobile-first interface.

## Current release

The production application is deployed on Vercel.

- Production URL: https://islamic-knowledge-platform-web.vercel.app/
- Production deployment: `dpl_3Go1dFztrzy9HutNUjwYSBz2FDu4`
- Production commit: `84f8d85f85512463f12d9cbb6136ada4a848162b`
- Deployment state: READY
- Vercel status: SUCCESS

The production shell and the major application routes have been verified with HTTP 200 responses. The project also has automated typecheck, production-build, smoke and prayer/Qibla regression gates. Real-device verification was performed by the project owner, including website loading, PWA installation/launch and feature interaction.

## Features

### Primary
- Home dashboard
- Quran browsing and reader
- Prayer times and preferences
- Qibla compass
- Dua and Dhikr
- Hadith and Sunnah
- Bottom navigation with five primary destinations
- Global search for application modules and Quran surahs
- Light/dark theme

### Secondary
- Salah & Wudu learning
- Zakat/Nisab calculator
- Hijri calendar
- Ramadan
- Hajj & Umrah
- Seerah
- Islamic Quiz

### PWA
- Web app manifest
- Installable on supported browsers/devices
- Mobile-first layout
- Installed PWA launch verified on a real Android device

## Routes

| Route | Module |
|---|---|
| `/` | Home |
| `/quran` | Quran |
| `/quran/:surah` | Quran reader |
| `/prayer` | Prayer |
| `/dua` | Dua |
| `/hadith` | Hadith |
| `/qibla` | Qibla |
| `/learn/salah` | Salah learning |
| `/zakat` | Zakat |
| `/calendar` | Hijri calendar |
| `/ramadan` | Ramadan |
| `/hajj` | Hajj |
| `/seerah` | Seerah |
| `/quiz` | Quiz |

## Architecture

The application is a client-side React SPA built with Vite. Route state is handled in `src/App.tsx` using the browser History API. Feature screens are lazy-loaded where appropriate. Service modules isolate network access and timeout/error handling.

Key areas:
- `src/components/` — UI and feature screens
- `src/services/` — live network services
- `src/data/` — Quran catalog/repository data
- `src/utils/` — calculations and shared utilities
- `scripts/` — regression and smoke tests
- `public/` — PWA/static assets

## Online-only policy

Islamic content is intended to be fetched from its configured online sources. User preferences and local UI state may use browser `localStorage`, but the project does not describe itself as an offline Islamic-content cache.

## Development

Requirements:
- Node.js 22 is used by CI.
- npm

Commands:

```bash
npm ci
npm run lint
npm run build
npm run test:smoke
npm run test:prayer
npm run dev
```

## Verification

The latest green Web CI run was run 274 (`35522967334`) on commit `97731d23b6d4be0a12d8d2ff4e76fb383dcd8598`. It completed dependency installation, typecheck, production build, smoke regression, prayer/Qibla regression and artifact upload.

The smoke test reports 8 required files and 29 regression checks.

## Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — development workflow
- [ARCHITECTURE.md](ARCHITECTURE.md) — application architecture
- [FEATURES.md](FEATURES.md) — feature/module inventory
- [API_SOURCES.md](API_SOURCES.md) — live data sources and behavior
- [ROUTING.md](ROUTING.md) — routes and deep-link behavior
- [PWA_INSTALL.md](PWA_INSTALL.md) — PWA/install behavior
- [ACCESSIBILITY_QA.md](ACCESSIBILITY_QA.md) — accessibility and QA
- [DEPLOYMENT.md](DEPLOYMENT.md) — CI/Vercel release process
- [ROADMAP.md](ROADMAP.md) — known limitations and future work
- [CONTENT_LICENSE.md](CONTENT_LICENSE.md) — content/source licensing notes
- [CHANGE.md](CHANGE.md) — release/change history
