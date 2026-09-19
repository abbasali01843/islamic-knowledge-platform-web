# Content sources and licenses

This document tracks **religious and third-party content** used by Islamic Knowledge Platform.
Application source code is separate from content rights.

> **Policy:** We do not modify Quranic Arabic text. Hadith and dua entries show source references in the UI. Content is for end-user display inside the app — not for resale as a raw dataset or API.

## Quran

| Asset | Source | Notes |
|-------|--------|--------|
| Arabic text (Hafs / Uthmani-style) | Generated offline package via project scripts; aligned with widely used verified digital texts (e.g. Tanzil-class sources) | Do not alter ayah text |
| Bengali translation | Packaged with reader metadata (e.g. Rowwad-class attribution in content pipeline) | Show translator credit in-app |
| Structural metadata (juz, page, sajdah) | Content generation pipeline | Validated in CI (114 surahs / 6236 ayahs) |
| Optional fonts (future) | e.g. KFGQPC Uthmanic | Respect KFGQPC terms if bundled |
| Audio (future) | e.g. EveryAyah / Quran.com ecosystem | Stream or download per upstream terms; not redistributed as a separate product |

## Prayer times & Qibla

| Asset | Source | Notes |
|-------|--------|--------|
| Calculation | On-device algorithm (IFB / MWL / ISNA parameters; Hanafi vs standard Asr shadow) | Same family as common open prayer-time math (praytimes.org-style) |
| Default method (BD) | Islamic Foundation Bangladesh–style 18° angles | User-selectable |
| City coordinates | App location list (Bangladesh districts / major cities) | Offline |
| Qibla | Great-circle bearing to Kaaba (approx. 21.4225°N, 39.8262°E) | On-device |

## Hadith (planned / web preview)

| Asset | Source | Notes |
|-------|--------|--------|
| Collections | e.g. open datasets compatible with sunnah.com / community JSON APIs | Always show book + number |
| Translations | Per-edition rights | Attribute translator; prefer explicitly licensed open packages for offline bundles |

**Editorial rule:** Prefer graded sahih/hasan material for default offline “lite” packs; never present weak narrations as sahih.

## Dua & adhkar (planned / web preview)

| Asset | Source | Notes |
|-------|--------|--------|
| Hisnul Muslim–style compilations | Classical compilation (Sa’id bin Ali bin Wahf al-Qahtani) as commonly published | Arabic + meaning + source reference per item |
| Quranic duas | Quran text | Same rules as Quran |

## Names of Allah, fiqh guides, zakat help text

Educational summaries must cite Quran/Hadith where claims are made. Zakat *rates* for gold/silver may be user-entered or fetched online; calculations run on-device.

## Third-party libraries

See Gradle / npm lockfiles for software licenses (Apache-2.0, MIT, etc.). Those govern code, not revelation text.

## In-app attribution

Screens that show Quran, Hadith, or dua SHOULD expose:

- Source name (and number for Hadith)
- Translation/edition credit where applicable
- A link or path to this document (About / Settings)

## Updates

When adding a new content pack, append a row here and bump the pack `manifest` version in the offline content pipeline.
