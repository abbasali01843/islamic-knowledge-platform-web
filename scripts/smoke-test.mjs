import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'src/App.tsx',
  'src/services/hijriCalendarApi.ts',
  'src/services/prayerTimesApi.ts',
  'src/services/duaApi.ts',
  'src/data/quranRepository.ts',
  'src/utils/prayerCalculation.ts',
  'public/manifest.webmanifest'
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`Missing required file: ${file}`);
}

const checks = [
  ['Hijri API has timeout protection', 'src/services/hijriCalendarApi.ts', 'REQUEST_TIMEOUT_MS'],
  ['Hijri API supports cancellation', 'src/services/hijriCalendarApi.ts', 'AbortSignal'],
  ['Prayer API supports cancellation', 'src/services/prayerTimesApi.ts', 'AbortSignal'],
  ['Quran API has timeout protection', 'src/data/quranRepository.ts', 'REQUEST_TIMEOUT_MS'],
  ['Dua detail requests are concurrency limited', 'src/services/duaApi.ts', 'DETAIL_CONCURRENCY'],
  ['PWA manifest exists', 'public/manifest.webmanifest', 'name'],
  ['Global visible focus styling exists', 'src/index.css', ':focus-visible'],
  ['Reduced-motion preference is handled', 'src/index.css', 'prefers-reduced-motion'],
  ['Primary navigation has an accessible label', 'src/components/Navbar.tsx', 'aria-label="প্রধান নেভিগেশন"'],
  ['Primary navigation exposes active state', 'src/components/Navbar.tsx', 'aria-current'],
  ['Search dialog has an accessible name', 'src/App.tsx', 'aria-labelledby="ikp-search-title"'],
  ['Deep-link route handling is present', 'src/App.tsx', "window.location.pathname"],
  ['Browser back/forward handling is present', 'src/App.tsx', "popstate"],
  ['Hadith API has upstream fallback candidates', 'src/services/hadithApi.ts', 'raw.githubusercontent.com'],
  ['Hadith API has timeout protection', 'src/services/hadithApi.ts', 'REQUEST_TIMEOUT_MS'],
  ['Dua API preserves source attribution', 'src/services/duaApi.ts', 'DUA_SOURCE_URL'],
  ['Primary route / is registered', 'src/App.tsx', "'/': 0"],
  ['Quran route is registered', 'src/App.tsx', "'/quran': 1"],
  ['Prayer route is registered', 'src/App.tsx', "'/prayer': 2"],
  ['Dua route is registered', 'src/App.tsx', "'/dua': 3"],
  ['Hadith route is registered', 'src/App.tsx', "'/hadith': 4"],
  ['Secondary route /learn/salah is registered', 'src/App.tsx', "'/learn/salah'"],
  ['Secondary route /zakat is registered', 'src/App.tsx', "'/zakat'"],
  ['Secondary route /calendar is registered', 'src/App.tsx', "'/calendar'"],
  ['Secondary route /ramadan is registered', 'src/App.tsx', "'/ramadan'"],
  ['Web module /qibla is registered', 'src/App.tsx', "'/qibla'"],
  ['Web module /hajj is registered', 'src/App.tsx', "'/hajj'"],
  ['Web module /seerah is registered', 'src/App.tsx', "'/seerah'"],
  ['Web module /quiz is registered', 'src/App.tsx', "'/quiz'"]
];
for (const [label, file, needle] of checks) {
  const content = readFileSync(join(root, file), 'utf8');
  if (!content.includes(needle)) failures.push(`${label}: expected ${needle} in ${file}`);
}

if (!existsSync(join(root, 'dist')) || !statSync(join(root, 'dist')).isDirectory()) {
  failures.push('Production build output missing: dist/');
} else if (!existsSync(join(root, 'dist/index.html'))) {
  failures.push('Production build output missing: dist/index.html');
}

if (failures.length) {
  console.error('Smoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Smoke test passed: ${requiredFiles.length} required files and ${checks.length} regression checks verified.`);
