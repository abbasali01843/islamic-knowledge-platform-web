# Web Release Candidate Status

**Project:** Islamic Knowledge Platform — Web/PWA  
**Snapshot:** 2026-09-20  
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
| PWA install flow | ✅ Implemented; production-device verification pending |
| SPA deep links | ✅ Implemented; production-device verification pending |
| Geolocation | ✅ Implemented; device verification pending |
| Prayer API + fallback | ✅ Implemented; live production verification pending |
| Prayer preference persistence | ✅ Implemented |
| Monthly prayer timetable | ✅ Implemented |
| Hijri calendar | ✅ Implemented; selected-location timezone is used for date conversion |
| Quran live reader | ✅ Implemented; API requests have a 10s timeout |
| Hadith live API | ✅ Implemented with upstream fallback candidates |
| Dua live API | ✅ Implemented with concurrency-limited detail requests |
| Zakat/Nisab | ✅ Implemented |
| Qibla compass | ⚠️ Implemented; real-device orientation verification pending |
| Global Islamic Search | ⚠️ Implemented; module/content coverage is not full live-content search |
| Navigation/accessibility pass | ⚠️ Code-level focus/ARIA/reduced-motion guards implemented; browser/device verification pending |
| Performance pass | ⚠️ Production build verified; real-device measurement pending |
| SEO metadata pass | ⚠️ Basic metadata only; route-specific metadata/SSR remains future work |
| Production deployment | ❌ Latest commit `97731d23` currently reports Vercel `failure` with a `build-rate-limit` target |
| Real-device QA | ⏳ Pending |
| Final 100% release verification | ⏳ Blocked until deployment and browser/device QA are verified |

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

## Current deployment blocker

The latest GitHub combined status for `97731d23` reports:

- **Context:** Vercel
- **State:** Failure
- **Target:** Vercel account/build-rate-limit page

This is currently treated as a deployment-platform/build-limit blocker, not as a failed application build, because the same commit passed the complete GitHub CI pipeline including the production build.

No successful production deployment is being claimed for `97731d23`.

## Verification snapshot

The prayer regression history is now resolved in CI:

- Exact Kaaba-coordinate bearing regression was corrected.
- Chattogram Qibla bearing expectation was corrected to the verified calculation range.
- Chattogram-to-Kaaba distance expectation was corrected to the verified calculation range.
- Run 274 is fully green after these regression-vector corrections.

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

## Documentation policy

The complete project documentation will be rewritten from scratch only after the project reaches the 100% verification gate. Until then, this file is maintained as a factual release-status record and is not treated as the final documentation set.

## Next milestone

**Resolve/verify production deployment → run browser/device QA → complete final release verification → rewrite all documentation from scratch from verified facts.**

Latest audited commit: `97731d23b6d4be0a12d8d2ff4e76fb383dcd8598`
