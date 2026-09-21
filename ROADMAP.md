# Roadmap and Known Limitations

## Current baseline

The current release is a verified production Web/PWA candidate with the main UI redesign and real-device acceptance completed.

## Known limitations

### Search
Global search covers application modules and Quran surah metadata. It is not a universal full-text index of every live Hadith/Dua/content response.

### Live APIs
Upstream APIs are external dependencies. Timeout and fallback behavior reduce failure impact but cannot guarantee third-party availability.

### Qibla sensors
Qibla accuracy depends on device sensors, calibration, device orientation and location permission. Manual mode is available for testing/desktop scenarios.

### Accessibility
The application has accessibility foundations and regression guards, but this repository does not constitute a formal WCAG certification or screen-reader audit.

### Performance
No fixed Lighthouse or lab performance score is treated as a release requirement in the current project documentation.

### Platform coverage
Real Android use has been verified. iOS Safari and tablet/desktop should receive separate acceptance testing if those platforms become formal release targets.

### SEO
Basic document metadata is present. Route-specific metadata and SSR are future improvements.

## Future improvements

- Full-content search across live Quran/Hadith/Dua datasets
- More robust API caching/retry strategy
- Formal accessibility audit
- Instrumented performance budgets
- Route-specific SEO/OG metadata
- More comprehensive cross-browser/device test automation
- Expanded content-source observability
- Additional educational modules
