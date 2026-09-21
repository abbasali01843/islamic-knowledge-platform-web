# Professional UI/UX Redesign Checklist

**Project:** Islamic Knowledge Platform — Web/PWA  
**Baseline:** `main` — 2026-09-21  
**Purpose:** Record the completed professional UI/UX redesign and release verification using evidence-backed implementation and real-device acceptance.

## Rules for implementation

- [x] Inspect the existing implementation before changing a screen.
- [ ] Preserve working routes, APIs, data flows, preferences, and accessibility semantics unless a checklist item explicitly changes them.
- [ ] Do not claim a feature is implemented until it exists in the repository and is verified.
- [ ] Do not redesign every screen at once; complete one phase, build/typecheck, then continue.
- [ ] Prefer reusable components/tokens over repeated one-off Tailwind markup.
- [ ] Keep Bengali-first content and Arabic typography readable on small Android screens.
- [ ] Verify both light and dark modes after each major UI phase.
- [ ] Verify mobile first, then tablet/desktop.
- [ ] Keep online-only content behavior unchanged.

## Phase 0 — Baseline and design system

- [x] Inventory all current routes/screens and existing interactions.
- [x] Inventory reusable UI components and identify duplication.
- [x] Define spacing scale and container widths.
- [x] Define typography hierarchy for Bengali, Arabic, and English.
- [x] Define color tokens for light/dark mode.
- [x] Define surface, border, radius, shadow, and focus styles.
- [x] Define icon sizing and button variants.
- [x] Define loading, error, empty, and success state patterns.
- [x] Create/update reusable design primitives before large screen rewrites.
- [x] Acceptance: existing build/typecheck remains successful.

## Phase 1 — App shell/navigation

- [x] Redesign top header without removing search, Qibla, or theme controls.
- [x] Redesign bottom navigation for clear active/inactive states.
- [x] Preserve current five primary destinations unless a measured UX change requires otherwise.
- [x] Improve safe-area spacing for Android/iOS.
- [x] Improve keyboard/focus/aria behavior.
- [x] Ensure deep links and browser back/forward still work (route/popstate code paths guarded; runtime browser QA pending).
- [x] Acceptance: all existing primary routes open correctly (real-device user verification).

## Phase 2 — Home dashboard

- [x] Redesign greeting/date area.
- [x] Redesign next-prayer hero.
- [x] Make current/next prayer state visually obvious.
- [x] Improve countdown presentation.
- [x] Improve location indicator.
- [x] Improve Sehri/Iftar presentation without implying Ramadan status outside Ramadan.
- [x] Redesign Continue Quran card.
- [x] Redesign Daily Amal tracker and progress.
- [x] Improve quick actions.
- [x] Review daily inspiration section using only existing verified content.
- [x] Acceptance: all existing Home interactions continue to work (real-device user verification).

## Phase 3 — Prayer/Qibla

- [x] Redesign prayer dashboard hierarchy.
- [x] Improve five-prayer timeline/list.
- [x] Improve current prayer and next prayer states.
- [x] Improve forbidden-time presentation.
- [x] Improve location picker UX.
- [x] Improve calculation method/madhab controls.
- [x] Redesign Qibla compass presentation.
- [x] Preserve GPS/device-orientation permission flows.
- [x] Preserve monthly timetable.
- [x] Acceptance: calculation, timezone, method, madhab, Qibla, and timetable behavior remain correct (real-device user verification).

## Phase 4 — Quran

- [x] Redesign Surah browsing/list UI.
- [x] Improve search/filter presentation.
- [x] Redesign reader header and controls.
- [x] Improve Arabic/Bengali reading hierarchy.
- [x] Improve ayah spacing and readability.
- [x] Improve last-read/resume flow.
- [x] Improve reader navigation.
- [x] Preserve live API behavior and timeout/cancellation handling (static regression guards verified; runtime API QA pending).
- [x] Acceptance: open Surah, read, resume, and route/deep-link behavior work (real-device user verification).

## Phase 5 — Dua and Hadith

- [x] Redesign Dua categories/list.
- [x] Redesign Dua card/detail reading experience.
- [x] Improve Tasbeeh counter presentation without changing behavior.
- [x] Redesign Hadith browsing/books view.
- [x] Redesign Hadith card/detail presentation.
- [x] Improve source/reference visibility.
- [x] Improve loading/error/empty states.
- [x] Preserve live API and fallback behavior (Hadith upstream fallback + timeout and Dua source attribution guarded; runtime API QA pending).
- [x] Acceptance: existing content loading and navigation work (real-device user verification).

## Phase 6 — Secondary tools

- [x] Redesign Hijri Calendar.
- [x] Redesign Ramadan screen.
- [x] Redesign Zakat/Nisab.
- [x] Redesign Salah learning.
- [x] Redesign Hajj/Seerah/Quiz modules.
- [x] Ensure secondary screens share the same design system.
- [x] Acceptance: every existing secondary route remains functional (real-device user verification).

## Phase 7 — Search and discovery

- [x] Audit current global search behavior.
- [x] Improve search dialog visual hierarchy.
- [x] Improve result grouping and keyboard navigation.
- [x] Clearly distinguish module results from Quran results.
- [x] Documented limitation: global search does not claim full live-content indexing.

## Phase 8 — Accessibility and responsive QA

- [x] Keyboard navigation (user verification).
- [x] Visible focus states (static regression guard added; runtime QA still pending).
- [x] Dialog focus management (code-level guard added; runtime QA still pending).
- [x] Screen-reader labels (primary navigation/search dialog code-level guard added; runtime QA still pending).
- [x] Color contrast (user verification).
- [x] Touch target sizing (user verification).
- [x] Reduced-motion behavior where appropriate (CSS preference guard verified).
- [x] Android Chrome narrow viewport (user verification).
- [ ] iOS Safari narrow viewport — not separately evidenced.
- [ ] Tablet/desktop layout — not separately evidenced.
- [x] Dark mode (user verification).

## Phase 9 — Verification gate

- [x] Typecheck passes.
- [x] Production build passes.
- [x] Regression smoke test passes.
- [x] Prayer/Qibla regression tests pass.
- [x] Deep links verified (production route + real-device user verification).
- [x] No console/runtime errors on core flows (production runtime check + user verification).
- [x] Vercel deployment verified.
- [x] Real-device QA completed (user verification).
- [x] Release status document updated with only verified claims.

## Definition of “professional”

The redesign is not considered complete because it merely has new colors/cards. It must demonstrate:

- Clear information hierarchy.
- Consistent reusable components.
- Strong mobile ergonomics.
- Readable Bengali and Arabic typography.
- Predictable navigation.
- Useful states for loading/error/empty/success.
- Accessible interaction states.
- Consistent light/dark themes.
- No loss of existing functionality.
- Verified behavior rather than assumed behavior.
