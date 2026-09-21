# PWA and Installation

## Manifest

The application publishes:

`/manifest.webmanifest`

The production HTML references the manifest and sets a theme color.

## Install model

The application is a web application that can be installed as a PWA on supported browsers/devices. Installation UI is handled by the application's PWA install prompt where the platform exposes an install capability.

## Verified behavior

The project owner verified on a real Android device that:
- the production website loads
- the PWA can be installed
- the installed PWA launches successfully

## Important distinction

PWA installation does not mean that all Islamic content is available offline. The product is documented as online-only for Islamic content. Browser-local state may persist preferences/bookmarks/features where implemented.

## PWA troubleshooting

If installation is not offered:
1. Confirm the production site is served over HTTPS.
2. Confirm the browser supports PWA installation.
3. Open the site normally before checking the browser's install menu.
4. Recheck the manifest response.
5. If the installed shell is stale, remove/reinstall the PWA and reload the production site.
