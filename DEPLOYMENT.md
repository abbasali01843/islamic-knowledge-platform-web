# Deployment and Release

## Hosting

Production hosting is Vercel.

Project:
`islamic-knowledge-platform-web`

Production URL:
https://islamic-knowledge-platform-web.vercel.app/

## Current verified deployment

- Deployment: `dpl_3Go1dFztrzy9HutNUjwYSBz2FDu4`
- Commit: `84f8d85f85512463f12d9cbb6136ada4a848162b`
- State: READY
- Vercel status: SUCCESS

## CI

GitHub Actions workflow:

`.github/workflows/web-ci.yml`

The workflow runs typecheck, production build, smoke regression, prayer/Qibla regression and artifact upload.

## Release procedure

Before releasing:
1. Inspect the current main branch.
2. Run `npm ci`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Run `npm run test:smoke`.
6. Run `npm run test:prayer`.
7. Verify production deployment state.
8. Check major production routes.
9. Exercise the release on a real supported device.
10. Update release documentation only with evidence-backed results.

## Deployment safety

Avoid unnecessary repeated deployments when Vercel build-rate limits are active. The release history shows that the current production deployment eventually reached READY/SUCCESS after the earlier rate-limit failures.

## Rollback

If a release introduces a verified regression, use the Vercel deployment history to identify the last known-good deployment and promote/restore it according to the team's Vercel release process. Do not rewrite repository history solely to roll back a production deployment.
