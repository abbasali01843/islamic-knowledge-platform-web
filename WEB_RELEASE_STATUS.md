# Web Release Candidate Status

**Project:** Islamic Knowledge Platform — Web/PWA  
**Snapshot:** 2026-09-21  
**Branch:** `main`

## Release gate

| Area | Status |
|---|---|
| Typecheck | ✅ GitHub Actions passed on `97731d23` |
| Production build | ✅ GitHub Actions production build passed on `97731d23` |
| CI artifact upload | ✅ Web dist artifact uploaded successfully |
| Prayer/Qibla regression suite | ✅ Passed in CI |
| Smoke regression suite | ✅ Passed: 29 regression checks |
| Online-only Islamic content policy | ✅ Audited; device preferences use localStorage, Islamic content is not persisted locally |
| PWA install flow | ✅ Verified by user on a real Android device |
| SPA deep links | ⚠️ Implemented and code-guarded; direct-link refresh still requires separate device/browser verification |
| Geolocation | ⚠️ Implemented; real-device permission/denial flow still requires explicit verification |
| Prayer API + fallback | ⚠️ Implemented; live production API behavior still requires explicit verification |
| Prayer preference persistence | ✅ Implemented |
| Monthly prayer timetable | ✅ Implemented |
| Hijri calendar | ✅ Implemented; selected-location timezone is used for date conversion |
| Quran live reader | ✅ Implemented; API requests have a 10s timeout |
| Hadith live API | ✅ Implemented with upstream fallback candidates |
| Dua live API | ✅ Implemented with concurrency-limited detail requests |
| Zakat/Nisab | ✅ Implemented |
| Qibla compass | ⚠️ Implemented; real-device orientation accuracy still requires explicit verification |
| Global Islamic Search | ⚠️ Implemented; module/content coverage is not full live-content search |
| Navigation/accessibility pass | ⚠️ Code-level focus/ARIA/reduced-motion guards implemented; browser/device interaction verification pending |
| Performance pass | ⚠️ Production build verified; real-device measurement pending |
| SEO metadata pass | ⚠️ Basic metadata verified; route-specific metadata/SSR remains future work |
| Production deployment | ✅ Production deployment `84f8d85f` is READY; Vercel status is SUCCESS |
| Production homepage | ✅ User verified that the website loads on a real device |
| Installed PWA launch | ✅ User verified that the installed app launches |
| Real-device QA | 🟡 Partial: website load and PWA installation/launch verified; feature-by-feature interaction QA pending |
| Final 100% release verification | ⏳ Pending feature interaction, device/browser, API-flow, accessibility, and performance verification |

## Current verified CI result

Latest green GitHub Actions run:

- **Run:** `35522967334`
- **Workflow:** Web CI
- **Run number:** 274
- **Commit:** `97731d23b6d4be0a12d8d2ff4e76fb383dcd8598`
- **Conclusion:** Success

The run completed all configured gates successfully:

1. `npm ci`
2. TypeScript typecheck
3. Production build
4. Smoke test
5. Prayer/Qibla regression test
6. Web distribution artifact upload

The smoke test reported: **8 required files and 29 regression checks verified.**

## Current production deployment

The current production deployment is:

- **Deployment:** `dpl_3Go1dFztrzy9HutNUjwYSBz2FDu4`
- **Commit:** `84f8d85f85512463f12d9cbb6136ada4a848162b`
- **State:** READY
- **Target:** production
- **Vercel status:** SUCCESS
- **Commit message:** merge of the monthly prayer timetable date-parsing fix

The deployment's final tree matches the previously verified release tree, while also including the monthly prayer date-parser fix.

## Verification snapshot

The prayer regression history is resolved in CI:

- Exact Kaaba-coordinate bearing regression was corrected.
- Chattogram Qibla bearing expectation was corrected to the verified calculation range.
- Chattogram-to-Kaaba distance expectation was corrected to the verified calculation range.
- Run 274 is fully green after these regression-vector corrections.

Production-device evidence currently available:

- Website loads successfully.
- PWA installation succeeds.
- Installed PWA launches successfully.

These observations establish the production load/install gate, but do not by themselves verify every interactive feature.

## Feature QA still required

- [ ] Android Chrome feature-by-feature interaction
- [ ] Desktop Chrome
- [ ] Safari iOS
- [ ] Direct deep links and refresh
- [x] PWA installation
- [x] Installed PWA launch
- [ ] GPS permission and denial
- [ ] Prayer calculation/timezone/method/madhab
- [ ] Monthly timetable and API fallback
- [ ] Android/iOS Qibla orientation
- [ ] Quran/Hadith/Dua/Zakat/Hijri API flows
- [ ] Source attribution interaction
- [ ] Keyboard/focus/screen-reader checks
- [ ] Dark mode interaction
- [ ] Loading/error states
- [ ] Real-device performance measurement

## Documentation policy

The complete project documentation will be rewritten from scratch only after the project reaches the 100% verification gate. Until then, this file is maintained as a factual release-status record and is not treated as the final documentation set.

## Next milestone

**Complete feature-by-feature browser/device QA → verify API and interaction flows → complete final 100% release verification → rewrite all documentation from scratch from verified facts.**

Latest release-state commit: `84f8d85f`
