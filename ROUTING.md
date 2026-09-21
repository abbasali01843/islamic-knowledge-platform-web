# Routing and Deep Links

## Route map

| Path | Screen |
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
| `/calendar` | Calendar |
| `/ramadan` | Ramadan |
| `/hajj` | Hajj |
| `/seerah` | Seerah |
| `/quiz` | Quiz |

## Navigation model

Internal navigation uses:
- `history.pushState`
- pathname parsing
- `popstate` for browser back/forward

The route resolver lives in `src/App.tsx`.

## Quran reader

A Surah can be represented by `/quran/<number>`. The route resolver validates the numeric Surah against the Quran catalog before opening the reader.

## Vercel SPA fallback

The repository contains `vercel.json` so direct application paths can resolve to the SPA entry rather than requiring a server-rendered route for each module.

## Verification

All listed major production paths returned HTTP 200 during the release verification pass. Direct-link and refresh behavior was also exercised during real-device user verification.

## Adding a route

When adding a route:
1. Add route resolution in `src/App.tsx`.
2. Add navigation/search registration where appropriate.
3. Preserve History API behavior.
4. Add a smoke-test route registration guard.
5. Verify direct production URL access.
