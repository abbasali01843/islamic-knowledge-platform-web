# Professional UI/UX Redesign Checklist

**Project:** Islamic Knowledge Platform — Web/PWA  
**Baseline:** `main` — 2026-09-20  
**Purpose:** Redesign the existing working product without inventing unsupported features or breaking current functionality.

## Rules for implementation

- [ ] Inspect the existing implementation before changing a screen.
- [ ] Preserve working routes, APIs, data flows, preferences, and accessibility semantics unless a checklist item explicitly changes them.
- [ ] Do not claim a feature is implemented until it exists in the repository and is verified.
- [ ] Do not redesign every screen at once; complete one phase, build/typecheck, then continue.
- [ ] Prefer reusable components/tokens over repeated one-off Tailwind markup.
- [ ] Keep Bengali-first content and Arabic typography readable on small Android screens.
- [ ] Verify both light and dark modes after each major UI phase.
- [ ] Verify mobile first, then tablet/desktop.
- [ ] Keep online-only content behavior unchanged.

## Phase 0 — Baseline and design system

- [ ] Inventory all current routes/screens and existing interactions.
- [ ] Inventory reusable UI components and identify duplication.
- [ ] Define spacing scale and container widths.
- [ ] Define typography hierarchy for Bengali, Arabic, and English.
- [ ] Define color tokens for light/dark mode.
- [ ] Define surface, border, radius, shadow, and focus styles.
- [ ] Define icon sizing and button variants.
- [ ] Define loading, error, empty, and success state patterns.
- [ ] Create/update reusable design primitives before large screen rewrites.
- [ ] Acceptance: existing build/typecheck remains successful.

## Phase 1 — App shell/navigation

- [ ] Redesign top header without removing search, Qibla, or theme controls.
- [x] Redesign bottom navigation for clear active/inactive states.
- [ ] Preserve current five primary destinations unless a measured UX change requires otherwise.
- [x] Improve safe-area spacing for Android/iOS.
- [x] Improve keyboard/focus/aria behavior.
- [ ] Ensure deep links and browser back/forward still work.
- [ ] Acceptance: all existing primary routes open correctly.

## Phase 2 — Home dashboard

- [x] Redesign greeting/date area.
- [x] Redesign next-prayer hero.
- [x] Make current/next prayer state visually obvious.
- [x] Improve countdown presentation.
- [x] Improve location indicator.
- [ ] Improve Sehri/Iftar presentation without implying Ramadan status outside Ramadan.
- [x] Redesign Continue Quran card.
- [x] Redesign Daily Amal tracker and progress.
- [x] Improve quick actions.
- [ ] Review daily inspiration section using only existing verified content.
- [ ] Acceptance: all existing Home interactions continue to work.

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
- [ ] Acceptance: calculation, timezone, method, madhab, Qibla, and timetable behavior remain correct.

## Phase 4 — Quran

- [x] Redesign Surah browsing/list UI.
- [x] Improve search/filter presentation.
- [x] Redesign reader header and controls.
- [x] Improve Arabic/Bengali reading hierarchy.
- [ ] Improve ayah spacing and readability.
- [x] Improve last-read/resume flow.
- [x] Improve reader navigation.
- [ ] Preserve live API behavior and timeout/cancellation handling.
- [ ] Acceptance: open Surah, read, resume, and route/deep-link behavior work.

## Phase 5 — Dua and Hadith

- [x] Redesign Dua categories/list.
- [x] Redesign Dua card/detail reading experience.
- [x] Improve Tasbeeh counter presentation without changing behavior.
- [x] Redesign Hadith browsing/books view.
- [x] Redesign Hadith card/detail presentation.
- [x] Improve source/reference visibility.
- [x] Improve loading/error/empty states.
- [ ] Preserve live API and fallback behavior.
- [ ] Acceptance: existing content loading and navigation work.

## Phase 6 — Secondary tools

- [ ] Redesign Hijri Calendar.
- [ ] Redesign Ramadan screen.
- [ ] Redesign Zakat/Nisab.
- [ ] Redesign Salah learning.
- [ ] Redesign Hajj/Seerah/Quiz modules.
- [ ] Ensure secondary screens share the same design system.
- [ ] Acceptance: every existing secondary route remains functional.

## Phase 7 — Search and discovery

- [ ] Audit current global search behavior.
- [ ] Improve search dialog visual hierarchy.
- [ ] Improve result grouping and keyboard navigation.
- [ ] Clearly distinguish module results from Quran results.
- [ ] Do not claim full-content search until all relevant live content is actually indexed/searchable.

## Phase 8 — Accessibility and responsive QA

- [ ] Keyboard navigation.
- [ ] Visible focus states.
- [ ] Dialog focus management.
- [ ] Screen-reader labels.
- [ ] Color contrast.
- [ ] Touch target sizing.
- [ ] Reduced-motion behavior where appropriate.
- [ ] Android Chrome narrow viewport.
- [ ] iOS Safari narrow viewport.
- [ ] Tablet/desktop layout.
- [ ] Dark mode.

## Phase 9 — Verification gate

- [ ] Typecheck passes.
- [ ] Production build passes.
- [ ] Regression smoke test passes.
- [ ] Prayer/Qibla regression tests pass.
- [ ] Deep links verified.
- [ ] No console/runtime errors on core flows.
- [ ] Vercel deployment verified.
- [ ] Real-device QA completed.
- [ ] Release status document updated with only verified claims.

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
