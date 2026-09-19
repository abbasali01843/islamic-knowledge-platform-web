import type { LocationConfig } from '../types/prayer';
import { BANGLADESH_DISTRICTS, INTERNATIONAL_CITIES } from '../data/bangladeshDistricts';

const ALL_LOCATIONS = [...BANGLADESH_DISTRICTS, ...INTERNATIONAL_CITIES];

function distanceSquared(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const latScale = Math.cos((aLat * Math.PI) / 180);
  const dLat = aLat - bLat;
  const dLon = (aLon - bLon) * latScale;
  return dLat * dLat + dLon * dLon;
}

function nearestKnownLocation(latitude: number, longitude: number): LocationConfig {
  return ALL_LOCATIONS.reduce((nearest, candidate) => {
    return distanceSquared(latitude, longitude, candidate.latitude, candidate.longitude) <
      distanceSquared(latitude, longitude, nearest.latitude, nearest.longitude)
      ? candidate
      : nearest;
  }, ALL_LOCATIONS[0]);
}

export function locationFromCoordinates(latitude: number, longitude: number): LocationConfig {
  const nearest = nearestKnownLocation(latitude, longitude);
  const browserTimezone = -new Date().getTimezoneOffset() / 60;

  return {
    id: 'gps-current',
    nameBengali: nearest.country === 'বাংলাদেশ'
      ? `${nearest.nameBengali} (GPS)`
      : 'বর্তমান অবস্থান (GPS)',
    nameEnglish: nearest.country === 'বাংলাদেশ'
      ? `${nearest.nameEnglish} (GPS)`
      : 'Current Location (GPS)',
    division: nearest.country === 'বাংলাদেশ' ? nearest.division : undefined,
    country: nearest.country,
    latitude: Number(latitude.toFixed(5)),
    longitude: Number(longitude.toFixed(5)),
    timezone: Number.isFinite(browserTimezone) ? browserTimezone : nearest.timezone,
  };
}

export function requestBrowserLocation(): Promise<LocationConfig> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('GEOLOCATION_UNSUPPORTED'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(locationFromCoordinates(coords.latitude, coords.longitude)),
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

/**
 * Home screen may use an already-granted permission without interrupting the user.
 * If permission is unavailable or still undecided, callers should keep their
 * non-GPS fallback and let the explicit Prayer location picker request access.
 */
export async function requestGrantedBrowserLocation(): Promise<LocationConfig | null> {
  if (!navigator.geolocation || !navigator.permissions) return null;

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state !== 'granted') return null;
    return await requestBrowserLocation();
  } catch {
    return null;
  }
}
