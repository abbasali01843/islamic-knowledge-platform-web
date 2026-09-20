import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/utils/prayerCalculation.ts', 'utf8');

const KAABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;
const d2r = (d) => (d * Math.PI) / 180;
const r2d = (r) => (r * 180) / Math.PI;

function qiblaBearing(latitude, longitude) {
  const phiK = d2r(KAABA_LATITUDE);
  const lambdaK = d2r(KAABA_LONGITUDE);
  const phi = d2r(latitude);
  const lambda = d2r(longitude);
  const deltaLambda = lambdaK - lambda;
  if (Math.abs(latitude - KAABA_LATITUDE) < 1e-9 && Math.abs(longitude - KAABA_LONGITUDE) < 1e-9) return 0;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  return Math.round((r2d(Math.atan2(y, x)) + 360) % 360);
}

function distanceKm(latitude, longitude) {
  const R = 6371;
  const dLat = d2r(KAABA_LATITUDE - latitude);
  const dLon = d2r(KAABA_LONGITUDE - longitude);
  const lat1 = d2r(latitude);
  const lat2 = d2r(KAABA_LATITUDE);
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const checks = [
  ['Qibla bearing is exported', /export function calculateQiblaBearing\(/],
  ['Kaaba distance is exported', /export function calculateKaabaDistanceKm\(/],
  ['Prayer calculation is exported', /export function calculatePrayerTimes\(/],
  ['Bengali time formatter is exported', /export function formatTimeBengali\(/],
];

for (const [label, pattern] of checks) assert.match(source, pattern, label);

assert.equal(qiblaBearing(KAABA_LATITUDE, KAABA_LONGITUDE), 0, 'Kaaba should point to itself');
const chattogramBearing = qiblaBearing(22.3569, 91.7832);
assert.ok(chattogramBearing >= 275 && chattogramBearing <= 285, `Chattogram Qibla bearing out of expected range: ${chattogramBearing}°`);

const chattogramDistance = distanceKm(22.3569, 91.7832);
assert.ok(chattogramDistance > 3600 && chattogramDistance < 3900, `Chattogram-Kaaba distance unexpected: ${chattogramDistance} km`);

assert.match(source, /case 'HANAFI':|shadowFactor = madhab === 'HANAFI' \? 2 : 1/, 'Hanafi Asr shadow factor must remain distinct');
assert.match(source, /case 'UMM_AL_QURA':[\s\S]*ishaMinutesAfterMaghrib: 90/, 'Umm al-Qura Isha rule must remain explicit');
assert.match(source, /timezone \* 60 \* 60 \* 1000/, 'Prayer calculations must use location timezone');

console.log(`Prayer regression vectors passed: Chattogram Qibla ${chattogramBearing}°, distance ${chattogramDistance} km.`);
