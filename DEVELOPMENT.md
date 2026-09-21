# Development Guide

## Environment

This repository is a Vite React application.

- Node.js: CI uses 22
- Package manager: npm
- TypeScript: 5.6.x
- React: 18.3.x
- Vite: 6.x
- Tailwind CSS: 4.x

## Setup

```bash
git clone https://github.com/abbasali01843/islamic-knowledge-platform-web.git
cd islamic-knowledge-platform-web
npm ci
```

## Local commands

```bash
npm run dev
npm run lint
npm run build
npm run test:smoke
npm run test:prayer
npm run preview
```

## CI contract

The GitHub Actions workflow at `.github/workflows/web-ci.yml` runs:

1. checkout
2. Node 22 setup
3. `npm ci`
4. `npm run lint`
5. `npm run build`
6. `npm run test:smoke`
7. `npm run test:prayer`
8. dist artifact upload

The current verified green run is run 274.

## Development rules

- Preserve working routes and live data behavior when changing UI.
- Use the shared `--ikp-*` design tokens in `src/index.css`.
- Keep Bengali and Arabic typography readable on narrow screens.
- Keep visible focus states and semantic labels.
- Add a regression guard when fixing a calculation or routing regression.
- Do not claim a live API works solely because its code exists; verify it when making a release claim.
- Do not mark a QA checklist item complete without evidence.

## Adding a feature

1. Identify the route and existing component.
2. Inspect related services/types.
3. Preserve loading, error and empty states.
4. Add route/search registration when needed.
5. Add or update regression coverage for important behavior.
6. Run typecheck, build and smoke/regression tests.
7. Test the changed flow on a real supported device.
8. Update documentation only with verified facts.
