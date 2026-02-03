// Nigeria-only map bounds and restrictions

export interface NigeriaBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

// Precise Nigeria boundaries for map restriction
export const NIGERIA_MAP_BOUNDS: NigeriaBounds = {
  north: 13.9,    // Northern border (near Chad/Niger)
  south: 4.3,     // Southern border (Gulf of Guinea)  
  west: 2.7,      // Western border (near Benin)
  east: 14.7      // Eastern border (near Cameroon)
};

// Nigeria center point for default map view
export const NIGERIA_CENTER = {
  latitude: 9.0765,   // Abuja
  longitude: 7.3986,
  zoom: 6
};

// Major Nigerian cities for fallback positioning
export const NIGERIAN_CITIES = {
  lagos: { lat: 6.5244, lng: 3.3792, name: 'Lagos' },
  abuja: { lat: 9.0765, lng: 7.3986, name: 'Abuja' },
  kano: { lat: 12.0022, lng: 8.5920, name: 'Kano' },
  ibadan: { lat: 7.3775, lng: 3.9470, name: 'Ibadan' },
  benin: { lat: 6.3350, lng: 5.6037, name: 'Benin City' },
  jos: { lat: 9.8965, lng: 8.8583, name: 'Jos' },
  kaduna: { lat: 10.5222, lng: 7.4383, name: 'Kaduna' },
  maiduguri: { lat: 11.8311, lng: 13.1510, name: 'Maiduguri' },
  zaria: { lat: 11.0804, lng: 7.7076, name: 'Zaria' },
  aba: { lat: 5.1066, lng: 7.3667, name: 'Aba' }
};

/**
 * Check if coordinates are within Nigeria boundaries
 */
export function isWithinNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_MAP_BOUNDS.south &&
    lat <= NIGERIA_MAP_BOUNDS.north &&
    lng >= NIGERIA_MAP_BOUNDS.west &&
    lng <= NIGERIA_MAP_BOUNDS.east
  );
}

/**
 * Clamp coordinates to Nigeria boundaries
 * If coordinates are outside Nigeria, move them to nearest Nigerian border
 */
export function clampToNigeria(lat: number, lng: number): { lat: number; lng: number } {
  const clampedLat = Math.max(
    NIGERIA_MAP_BOUNDS.south,
    Math.min(NIGERIA_MAP_BOUNDS.north, lat)
  );
  
  const clampedLng = Math.max(
    NIGERIA_MAP_BOUNDS.west,
    Math.min(NIGERIA_MAP_BOUNDS.east, lng)
  );
  
  return { lat: clampedLat, lng: clampedLng };
}

/**
 * Get nearest Nigerian city if user is outside Nigeria
 */
export function getNearestNigerianCity(lat: number, lng: number) {
  if (isWithinNigeria(lat, lng)) {
    return null; // User is already in Nigeria
  }
  
  let nearestCity = NIGERIAN_CITIES.abuja; // Default to Abuja
  let minDistance = Infinity;
  
  Object.values(NIGERIAN_CITIES).forEach(city => {
    const distance = getDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });
  
  return nearestCity;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Create MapLibre bounds object for Nigeria
 */
export function getNigeriaMapBounds() {
  return [
    [NIGERIA_MAP_BOUNDS.west, NIGERIA_MAP_BOUNDS.south], // Southwest
    [NIGERIA_MAP_BOUNDS.east, NIGERIA_MAP_BOUNDS.north]  // Northeast
  ] as [[number, number], [number, number]];
}

/**
 * Validate and restrict user location to Nigeria only
 */
export function validateLocationForNigeria(lat: number, lng: number): {
  isValid: boolean;
  correctedLat: number;
  correctedLng: number;
  message: string;
} {
  if (isWithinNigeria(lat, lng)) {
    return {
      isValid: true,
      correctedLat: lat,
      correctedLng: lng,
      message: 'Location is within Nigeria'
    };
  }
  
  // If outside Nigeria, redirect to nearest Nigerian city
  const nearestCity = getNearestNigerianCity(lat, lng);
  
  return {
    isValid: false,
    correctedLat: nearestCity.lat,
    correctedLng: nearestCity.lng,
    message: `Location outside Nigeria. Redirected to ${nearestCity.name}, Nigeria.`
  };
}