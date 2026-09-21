# Accessibility and QA

## Implemented accessibility foundations

The application includes:
- visible `:focus-visible` styling
- reduced-motion media handling
- accessible primary navigation label
- `aria-current` on active navigation
- accessible search-dialog naming
- Escape-to-close behavior
- focus restoration after closing search
- keyboard Tab trapping within the search dialog
- touch-oriented controls and spacing
- Bengali/Arabic typography hierarchy

## QA evidence

Automated smoke regression checks verify the presence of the key accessibility and interaction guards.

Real-device verification by the project owner confirms the application and PWA function correctly during normal use.

## QA scope

The release verification covered:
- primary navigation
- application routes
- Quran flow
- prayer/Qibla flow
- Dua/Hadith flows
- secondary modules
- PWA installation/launch
- production loading

## Not claimed

The project does not claim a formal WCAG audit, screen-reader certification, Lighthouse performance score, or cross-browser certification from the repository tests alone.

iOS Safari and tablet/desktop-specific acceptance should be treated as separate platform QA if those targets become release requirements.

## Regression commands

```bash
npm run lint
npm run build
npm run test:smoke
npm run test:prayer
```
