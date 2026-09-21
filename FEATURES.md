# Features and Modules

## Home

The home dashboard provides the primary daily entry point, including greeting/date hierarchy, next-prayer information, countdown/location context, Quran continuation, daily-activity progress and quick actions.

## Quran

- 114-surah catalog
- Surah search
- Reader screen
- Arabic/Bengali reading hierarchy
- Reader navigation
- Last-read/resume behavior
- Bookmarks/notes UI
- Route-aware Surah opening

## Prayer

- Five daily prayers
- Current/next prayer presentation
- Countdown
- Location controls
- Calculation method
- Madhab preference
- Monthly timetable
- Sehri/Iftar presentation
- Forbidden-time presentation
- Salah tracker and related prayer information

## Qibla

- Location-dependent Qibla bearing
- Device orientation support
- Permission state handling
- Alignment state
- Manual heading mode
- Calibration/use guidance

The UI no longer treats one fixed Bangladesh direction as universal; the displayed bearing is location-dependent.

## Dua

- Morning/evening entry
- Library/categories
- Search
- Bookmarks
- Live API loading
- Source attribution
- Loading/error/empty states
- Tasbeeh counter with configurable presets

## Hadith

- Live Hadith loading
- Book selection
- Topics/search/filtering
- Grade presentation
- Bookmarks
- Load-more/progressive loading
- Nawawi 40 section
- Source attribution
- Upstream fallback candidates

## Secondary modules

- Salah & Wudu guide
- Zakat/Nisab calculator
- Hijri calendar
- Ramadan
- Hajj & Umrah
- Seerah
- Quiz

## Global search

Search currently covers:
- application modules
- Quran surah metadata

It is intentionally not described as full-text indexing of every live Hadith/Dua/Quran verse.

## PWA

The web app exposes a manifest and is installable on supported devices. Real Android installation and installed-app launch have been verified.

## Themes and accessibility

- light/dark theme
- visible focus styles
- reduced-motion handling
- semantic navigation labels
- accessible search dialog naming/focus behavior
- touch-oriented mobile layout
