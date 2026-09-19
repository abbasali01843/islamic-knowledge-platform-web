# Development guide — Islamic Knowledge Platform

## Prerequisites

- JDK 17+
- Android SDK (compileSdk 35)
- Python 3.x (for Quran content generation)
- Optional local Gradle 8.11+ if `gradle-wrapper.jar` is not yet committed

## One-time: Gradle Wrapper jar

This repository includes `gradlew`, `gradlew.bat`, and `gradle/wrapper/gradle-wrapper.properties`.

If `gradle/wrapper/gradle-wrapper.jar` is missing (binary not committed yet), generate it once:

```bash
gradle wrapper --gradle-version 8.11.1
```

Then commit `gradle/wrapper/gradle-wrapper.jar` so CI and other developers can use `./gradlew` without a system Gradle install.

## Quran offline content

The committed asset at `feature/quran/src/main/assets/quran_reader.json` is a **small stub** (sample surahs only) so the repo stays light.

**CI always regenerates the full package** (114 surahs / 6,236 ayahs) before building.

For local full-content development:

```bash
python3 scripts/generate_quran_content.py --output feature/quran/src/main/assets/quran_reader.json
python3 scripts/validate_quran_content.py feature/quran/src/main/assets/quran_reader.json
```

Requires network access to:

- jsDelivr / quran-json (Arabic text)
- QuranEnc API (Bengali Rowwad translation)
- Al Quran Cloud API (Juz / Hizb / page / Sajdah metadata)

Do **not** commit the full generated JSON unless the team decides to vendor it permanently (it is large).

## Active Gradle modules

Only modules with real `build.gradle.kts` files are included in `settings.gradle.kts`:

| Module | Role |
|--------|------|
| `:app` | Application shell |
| `:core:design` | Theme, typography, shapes |
| `:core:model` | Shared domain models |
| `:feature:home` | Home screen |
| `:feature:quran` | Quran catalog + reader |

Placeholder directories (`feature/hadith`, `core/database`, etc.) stay in the tree for roadmap structure. **Add them to `settings.gradle.kts` only when they have a real build script.**

## Common commands

```bash
# After wrapper jar exists:
./gradlew :app:assembleDebug
./gradlew test
./gradlew lint

# Or with system Gradle while bootstrapping:
gradle :app:assembleDebug
```

## Branch policy

- `main` — releasable / integration
- `develop` — integration (optional)
- `feature/*` — new work
- `fix/*` — fixes
