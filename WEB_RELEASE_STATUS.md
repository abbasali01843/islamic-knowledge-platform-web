# Web Release Candidate Status

**Project:** Islamic Knowledge Platform — Web/PWA  
**Snapshot:** 2026-09-20  
**Branch:** `main`

## Release gate

| Area | Status |
|---|---|
| Typecheck | ⏳ Re-run required after audit fixes |
| Production build | ⏳ Re-run required after audit fixes |
| CI artifact upload | ⏳ Re-run required after audit fixes |
| Online-only Islamic content policy | ✅ Audited; device preferences use localStorage, Islamic content is not persisted locally |
| PWA install flow | ✅ Implemented |
| SPA deep links | ✅ Implemented |
| Geolocation | ✅ Implemented |
| Prayer API + fallback | ✅ Implemented |
| Prayer preference persistence | ✅ All declared calculation methods supported |
| Monthly prayer timetable | ✅ Implemented |
| Hijri calendar | ✅ Implemented; selected-location timezone is used for date conversion |
| Quran live reader | ✅ Implemented; API requests now have a 10s timeout |
| Hadith live API | ✅ Implemented |
| Dua live API | ⚠️ Implemented; first-page load currently makes multiple detail requests |
| Zakat/Nisab | ✅ Implemented |
| Qibla compass | ⚠️ Implemented; real-device verification pending |
| Global Islamic Search | ⚠️ Implemented; does not search all live content |
| Navigation/accessibility pass | ⚠️ Implemented; automated accessibility verification pending |
| Performance pass | ⚠️ Implemented; production measurement pending |
| SEO metadata pass | ⚠️ Basic metadata only; route-specific metadata/SSR remains future work |
| Production deployment | ⏳ Vercel status must be re-verified after new commits |
| Real-device QA | ⏳ Pending |

## Current audit findings

- Hijri date conversion now uses the selected location timezone instead of browser-local calendar fields.
- Quran API requests now abort after 10 seconds and support caller cancellation.
- Prayer preferences now preserve IFB, MWL, ISNA, Umm al-Qura and Egypt selections.
- Documentation now reflects actual localStorage use for device preferences and the salah tracker.
- No meaningful automated regression test suite is present yet.

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

**Automated regression tests + real-device QA**

After that: route-level code splitting → full-content Islamic search → optional account/cloud synchronization.

Latest audited commit: `e34f28230c3cb8d3bd124d316d617bb2d200ac2c`
