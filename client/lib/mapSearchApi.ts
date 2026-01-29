import axios from 'axios';
import { MAP_SEARCH_URL, MAP_REVERSE_URL } from './APIConstants';

// Map Search API interfaces
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

// Create a dedicated axios instance for map search API
const mapSearchClient = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
mapSearchClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Map Search API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * Search for places using the Map Search API (via local proxy)
 * @param query - Search query string
 * @param size - Number of results to return (default: 8)
 * @returns Promise<SearchResult[]>
 */
export async function searchPlaces(query: string, size: number = 8): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const url = `${MAP_SEARCH_URL}?search=${encodeURIComponent(query)}&size=${size}`;
    console.log('Map Search API Request (via proxy):', url);

    const response = await mapSearchClient.get<MapSearchResponse>(url);
    
    console.log('Map Search API Response:', response.data);
    
    // Transform the API response to SearchResult format
    const transformedResults = response.data.results.places.map(transformMapSearchToSearchResult);
    
    return transformedResults;
  } catch (error) {
    console.error('Map search failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Search request timed out. Please try again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Search service not found. Please check the API endpoint.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Search service is temporarily unavailable. Please try again later.');
      }
      if (error.response?.status === 0 || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
    
    throw new Error('Search failed. Please try again.');
  }
}

/**
 * Reverse geocode coordinates to get place information
 * @param lat - Latitude
 * @param lon - Longitude
 * @param searchTerm - Optional search term to filter results
 * @returns Promise<{display: string, type?: string}>
 */
export async function reverseGeocode(lat: number, lon: number, searchTerm?: string): Promise<{display: string, type?: string}> {
  try {
    let url = `${MAP_REVERSE_URL}?lat=${lat}&lon=${lon}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    
    console.log('Reverse geocoding request (via proxy):', url);

    const response = await mapSearchClient.get(url);
    
    console.log('Reverse geocoding response:', response.data);
    
    // Handle the response - need to check the actual format from the API
    const data = response.data;
    
    // Try to extract display name and type from the response
    // Prioritize 'name' over 'display_name'
    let display = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    let type: string | undefined;
    
    if (data && typeof data === 'object') {
      // Check for common response patterns
      if (data.results && data.results.places && data.results.places.length > 0) {
        const place = data.results.places[0];
        // Prioritize name over display_name, then fall back to address
        display = place.name || place.display_name || place.address?.full_address || display;
        type = place.classification?.category?.[0] || place.classification?.layer;
      } else if (data.name) {
        // Direct name field
        display = data.name;
        type = data.type || data.category;
      } else if (data.display_name) {
        display = data.display_name;
        type = data.type || data.category;
      } else if (data.address) {
        display = data.address;
        type = data.type;
      } else if (typeof data === 'string') {
        display = data;
      }
    }
    
    return { display, type };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Fallback to coordinates on error
    return { display: `${lat.toFixed(6)}, ${lon.toFixed(6)}` };
  }
}

export default {
  searchPlaces,
  reverseGeocode,
  transformMapSearchToSearchResult
};