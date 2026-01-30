// Direct API calls for map search and reverse geocoding using Nominatim - no proxy needed

// Map Search API interfaces (kept for compatibility)
export interface MapSearchPlace {
  id: string;
  name: string;
  display_name: string;
  coordinates: {
    latitude: number;
    longitude: number;
    lat_lon: [number, number];
    lon_lat: [number, number];
  };
  relevance: {
    similarity_score: number;
    confidence: string;
  };
  classification: {
    layer: string;
    source: string;
    category: string[];
  };
  address: {
    house_number?: string;
    street?: string;
    neighbourhood?: string;
    locality?: string;
    region?: string;
    country: string;
    country_code: string;
    postal_code?: string;
    full_address: string;
  };
  details: {
    population?: number;
    phone?: string;
    website?: string;
    opening_hours?: string;
    email?: string;
    operator?: string;
    brand?: string;
    amenity?: string;
    shop?: string;
    cuisine?: string;
    tourism?: string;
  };
  bounding_box?: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  source_info: {
    source: string;
    source_id: string;
    popularity?: number;
    last_updated: string;
  };
}

export interface MapSearchResponse {
  query: {
    text: string;
    parameters: {
      max_results: number;
      layer_filter?: string;
      source_filter?: string;
    };
  };
  results: {
    total_found: number;
    places: MapSearchPlace[];
  };
}

export interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  importance?: number;
}

// Helper function to transform new API response to SearchResult format
export const transformMapSearchToSearchResult = (place: MapSearchPlace): SearchResult => {
  return {
    place_id: place.id,
    // Prioritize name over display_name, then fall back to full_address
    display_name: place.name || place.display_name || place.address.full_address,
    lat: place.coordinates.latitude.toString(),
    lon: place.coordinates.longitude.toString(),
    type: place.classification.category[0] || place.classification.layer,
    category: place.classification.category.join(','),
    importance: place.relevance.similarity_score
  };
};



/**
 * Search for places using Nominatim API directly (no proxy)
 * @param query - Search query string
 * @param size - Number of results to return (default: 8)
 * @returns Promise<SearchResult[]>
 */
export async function searchPlaces(query: string, size: number = 8): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Use Nominatim API directly - no proxy needed
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${size}&addressdetails=1&extratags=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your-email@example.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Nominatim response to SearchResult format
    const transformedResults: SearchResult[] = data.map((item: any) => ({
      place_id: item.place_id?.toString() || item.osm_id?.toString() || Math.random().toString(),
      display_name: item.display_name || item.name || 'Unknown location',
      lat: item.lat,
      lon: item.lon,
      type: item.type || item.class,
      category: item.category || item.class,
      importance: parseFloat(item.importance) || 0
    }));
    
    return transformedResults;
  } catch (error) {
    console.error('Direct search failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      if (error.message.includes('HTTP error! status: 429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error.message.includes('HTTP error! status: 5')) {
        throw new Error('Search service is temporarily unavailable. Please try again later.');
      }
    }
    
    throw new Error('Search failed. Please try again.');
  }
}

/**
 * Reverse geocode coordinates to get place information using Nominatim API directly
 * @param lat - Latitude
 * @param lon - Longitude
 * @param searchTerm - Optional search term to filter results (not used in direct API)
 * @returns Promise<{display: string, type?: string}>
 */
export async function reverseGeocode(lat: number, lon: number, searchTerm?: string): Promise<{display: string, type?: string}> {
  try {
    // Use Nominatim API directly - no proxy needed
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your-email@example.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle Nominatim response format
    let display = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    let type: string | undefined;
    
    if (data && data.display_name) {
      display = data.display_name;
      type = data.type || data.class;
    } else if (data && data.address) {
      // Build display name from address components
      const addr = data.address;
      const parts = [];
      
      if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`);
      } else if (addr.road) {
        parts.push(addr.road);
      }
      
      if (addr.suburb || addr.neighbourhood) {
        parts.push(addr.suburb || addr.neighbourhood);
      }
      
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }
      
      if (addr.state) {
        parts.push(addr.state);
      }
      
      if (addr.country) {
        parts.push(addr.country);
      }
      
      if (parts.length > 0) {
        display = parts.join(', ');
      }
      
      type = data.type || data.class;
    }
    
    return { display, type };
    
  } catch (error) {
    console.error('Direct reverse geocoding failed:', error);
    
    // Fallback to coordinates on error
    return { display: `${lat.toFixed(6)}, ${lon.toFixed(6)}` };
  }
}

export default {
  searchPlaces,
  reverseGeocode,
  transformMapSearchToSearchResult
};