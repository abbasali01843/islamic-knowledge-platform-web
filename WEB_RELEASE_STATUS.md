# Web Release Candidate Status

**Project:** Islamic Knowledge Platform — Web/PWA  
**Snapshot:** 2026-09-20  
**Branch:** `main`

## Release gate

| Area | Status |
|---|---|
| Typecheck | ✅ Passed |
| Production build | ✅ Passed |
| CI artifact upload | ✅ Passed |
| Online-only content policy | ✅ Audited |
| PWA install flow | ✅ Implemented |
| SPA deep links | ✅ Implemented |
| Geolocation | ✅ Implemented |
| Prayer API + fallback | ✅ Implemented |
| Monthly prayer timetable | ✅ Implemented |
| Hijri calendar | ✅ Implemented |
| Quran live reader | ✅ Implemented |
| Hadith live API | ✅ Implemented |
| Dua live API | ✅ Implemented |
| Zakat/Nisab | ✅ Implemented |
| Qibla compass | ✅ Implemented |
| Global Islamic Search | ✅ Implemented |
| Navigation/accessibility pass | ✅ Completed |
| Performance pass | ✅ Completed |
| SEO metadata pass | ✅ Completed |
| Production deployment | ⏳ Pending |
| Real-device QA | ⏳ Pending |

## Known limitations

- Global search currently covers Quran metadata and platform modules, not full live Quran/Hadith/Dua content.
- Route-specific metadata/SSR is a future enhancement.
- Qibla orientation behavior varies by device/browser and needs real-device verification.
- External APIs may change or become unavailable.
- Fiqh-sensitive guidance requires careful source attribution.
- Account/cloud synchronization is intentionally deferred.

## Production QA checklist

- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Safari iOS
- [ ] Direct deep links and refresh
- [ ] PWA installation/standalone mode
- [ ] GPS permission and denial
- [ ] Prayer calculation/timezone/method/madhab
- [ ] Monthly timetable and API fallback
- [ ] Android/iOS Qibla orientation
- [ ] Quran/Hadith/Dua/Zakat/Hijri API flows
- [ ] Source attribution
- [ ] Keyboard/focus/screen-reader checks
- [ ] Dark mode
- [ ] Loading/error states

## Next milestone

**Production Release + Real-device QA**

After that: route-level code splitting → full-content Islamic search → optional account/cloud synchronization.

Latest verified pre-documentation commit: `92542ac8b9d35f8479612b9cbd2706ce711851a1`.
