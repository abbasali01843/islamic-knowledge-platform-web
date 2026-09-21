# API and Data Sources

## General policy

The application is online-first for Islamic content. Network services expose loading/error behavior rather than silently presenting unverified network data.

## Dua

Service: `src/services/duaApi.ts`

Configured root:

`https://dua-api.hisnul.workers.dev/api`

Source attribution shown by the application:

- ThelightHub Hisnul Muslim Dua API
- https://github.com/ThelightHub/dua-api

Behavior:
- 10-second request timeout
- first-page listing request
- detail requests
- maximum four concurrent detail requests
- AbortSignal support
- source label and URL retained in normalized items

## Hadith

Service: `src/services/hadithApi.ts`

Primary root:

`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1`

Source attribution:

- Fawaz Ahmed Hadith API
- https://github.com/fawazahmed0/hadith-api

Behavior:
- 10-second request timeout
- jsDelivr JSON/minified JSON candidates
- raw GitHub fallback candidates
- Arabic/Bengali edition pairing
- progressive section/book loading
- Promise.allSettled for multi-book batches

## Quran

Quran data access is implemented through `src/data/quranRepository.ts` and the Quran catalog. The repository includes request timeout protection for configured live reader requests.

## Prayer

Prayer data is provided through `src/services/prayerTimesApi.ts`, while calculation logic is in `src/utils/prayerCalculation.ts`.

The calculation layer explicitly preserves location timezone use and separate madhab handling. Monthly prayer date parsing has a dedicated fix in the release history.

## Hijri calendar

`src/services/hijriCalendarApi.ts` provides the configured Hijri calendar service with timeout/cancellation handling. Selected-location timezone is used for date conversion.

## Verification note

Code-level source/fallback guards are verified by automated regression tests. Live upstream availability can change independently of the repository; production release verification therefore includes real-device use rather than treating source URLs as permanent availability guarantees.
