# Change Log

All notable changes to **Islamic Knowledge Platform** are tracked here by milestone and release.

## v0.3.0-alpha — Salah (Android) + content policy

### In progress / this track
- `:feature:prayer` — offline prayer times, live countdown, major BD cities, Hanafi/Shafi‘i, IFB/MWL (PR #7).
- Home screen **live next prayer** card (shared preferences with Prayer screen).
- `CONTENT_LICENSE.md` — sources and attribution policy for Quran, prayer math, future hadith/dua.
- App `versionName` `0.3.0-alpha01` (ship APK after CI + device QA).

### Not yet
- Qibla, adhan notifications, full 64-district list, GPS.

## Phase 0 — Build health

### Completed
- Restricted `settings.gradle.kts` to modules that have real build scripts (`:app`, `:core:design`, `:core:model`, `:feature:home`, `:feature:quran`).
- Left roadmap placeholder directories in the tree without registering them as Gradle projects.
- Added Gradle Wrapper scripts and `gradle-wrapper.properties` (Gradle 8.11.1).
- Documented one-time `gradle-wrapper.jar` generation and local Quran content generation in `DEVELOPMENT.md`.
- Made CI prefer `./gradlew` when the wrapper jar is present, with a system `gradle` fallback.
- Release workflow now validates Quran content before packaging.
- Merged via PR #2.
- Monorepo dual CI (Android + Web) and restored Gradle root after web merge (PR #6).

### Optional follow-up
- Commit `gradle/wrapper/gradle-wrapper.jar` when a desktop Gradle install is available.

## v0.2.0-alpha — Quran ✅ released

**Release tags:** `v0.2.0-alpha01`, `v0.2.0-alpha02`  
**Device QA:** passed on Android phone (2026-09-13) for Quran milestone

### Completed
- Quran feature module and offline reader architecture.
- 114-surah catalog and full-content generation pipeline.
- Arabic text with Bengali translation metadata; Juz/page/sajdah metadata.
- Search, bookmarks, notes, copy/share, font scale, reader polish.
- CI validation for 114 surahs and 6,236 ayahs.
- Library tabs: Surah / Juz / Page / Bookmark / Notes.

### Optional later (not blocking)
- Dedicated Arabic font asset; audio recitation; hizb-quarter UI.

## v0.1.0-alpha01 — Foundation

### Released
- Initial Android/Compose foundation, modular structure, Material 3 shell.
- GitHub Actions Android build and release APK workflows.
- First prerelease APK: `v0.1.0-alpha01`.

## Development policy

- Development is organized into coherent milestones rather than tiny isolated changes.
- CI is checked at milestone boundaries; larger Gradle/dependency/release changes require CI verification.
- A release is considered ready only after CI verification and device APK testing.
- Only register a module in `settings.gradle.kts` when it has a real `build.gradle.kts`.
- Religious content sources are recorded in `CONTENT_LICENSE.md`.
