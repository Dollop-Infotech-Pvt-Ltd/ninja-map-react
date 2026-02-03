// Location utilities for Nigeria boundary checking and geolocation

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationCheckResult {
  isInNigeria: boolean;
  country?: string;
  state?: string;
  city?: string;
  message: string;
}

// Nigeria's approximate boundaries
const NIGERIA_BOUNDS = {
  north: 13.9,    // Northern border (near Chad/Niger)
  south: 4.3,     // Southern border (Gulf of Guinea)
  west: 2.7,      // Western border (near Benin)
  east: 14.7      // Eastern border (near Cameroon)
};

/**
 * Check if coordinates are within Nigeria's boundaries
 */
export function isLocationInNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS.south &&
    lat <= NIGERIA_BOUNDS.north &&
    lng >= NIGERIA_BOUNDS.west &&
    lng <= NIGERIA_BOUNDS.east
  );
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Check if user's current location is in Nigeria and return appropriate message
 */
export async function checkUserLocationForNigeria(): Promise<LocationCheckResult> {
  try {
    const location = await getCurrentLocation();
    const isInNigeria = isLocationInNigeria(location.latitude, location.longitude);
    
    if (isInNigeria) {
      return {
        isInNigeria: true,
        message: 'Welcome! You are in Nigeria and can access all NINja Map features.'
      };
    } else {
      // Try to get more specific location info using reverse geocoding
      let locationInfo = '';
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        const city = data.city || data.locality || '';
        const state = data.principalSubdivision || '';
        const country = data.countryName || '';
        
        locationInfo = [city, state, country].filter(Boolean).join(', ');
      } catch (error) {
        console.warn('Could not get detailed location info:', error);
      }

      return {
        isInNigeria: false,
        country: locationInfo.split(', ').pop(),
        message: `You are currently outside Nigeria${locationInfo ? ` (in ${locationInfo})` : ''}. NINja Map is optimized for Nigerian navigation. Some features may be limited in your current location.`
      };
    }
  } catch (error) {
    return {
      isInNigeria: false,
      message: 'Unable to determine your location. NINja Map works best in Nigeria.'
    };
  }
}

/**
 * Get distance between two coordinates (in kilometers)
 */
export function getDistanceFromNigeria(lat: number, lng: number): number {
  // Use center of Nigeria as reference point
  const nigeriaCenterLat = 9.0765;
  const nigeriaCenterLng = 7.3986;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (nigeriaCenterLat - lat) * Math.PI / 180;
  const dLng = (nigeriaCenterLng - lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * Math.PI / 180) * Math.cos(nigeriaCenterLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Known locations for testing (you can expand this)
 */
export const KNOWN_LOCATIONS = {
  // Nigeria locations
  lagos: { lat: 6.5244, lng: 3.3792, name: 'Lagos, Nigeria' },
  abuja: { lat: 9.0765, lng: 7.3986, name: 'Abuja, Nigeria' },
  kano: { lat: 12.0022, lng: 8.5920, name: 'Kano, Nigeria' },
  
  // International locations for testing
  indore: { lat: 22.7196, lng: 75.8577, name: 'Indore, MP, India' },
  london: { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
  newYork: { lat: 40.7128, lng: -74.0060, name: 'New York, USA' }
};