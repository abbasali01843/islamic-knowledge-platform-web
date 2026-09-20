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
  ['PWA manifest exists', 'public/manifest.webmanifest', 'name']
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
