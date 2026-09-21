# Content and Source Notes

## Purpose

This document records how the application treats external Islamic content and source attribution.

## Source attribution

Where live normalized content includes source metadata, the UI can expose the configured source label and URL.

Current documented live sources include:
- ThelightHub Hisnul Muslim Dua API
- Fawaz Ahmed Hadith API

The Quran, prayer and Hijri modules use their repository-configured data/services as described in `API_SOURCES.md`.

## Repository responsibility

Code in this repository should not remove source attribution from normalized live content.

External content remains subject to the terms, licenses and usage conditions of its respective upstream source. Users and maintainers should verify upstream licensing before redistributing content outside the intended application.

## Scope

This file is a source/attribution note, not a legal opinion and not a substitute for reviewing the current license of an upstream dataset or API.
