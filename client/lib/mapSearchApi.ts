// Direct API calls for map search and reverse geocoding using Ninja Map API

import axios from 'axios';
import { isWithinNigeria } from './nigeriaMapBounds';

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

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'https://api.ninja-map.dollopinfotech.com',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  }
});

/**
 * Search for places using the new Ninja Map API
 * @param query - Search query string
 * @param size - Number of results to return (default: 8)
 * @returns Promise<SearchResult[]>
 */
export async function searchPlaces(query: string, size: number = 8): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await axiosInstance.get('/api/map/search', {
      params: {
        search: query,
        size: size
      }
    });

    const data: MapSearchResponse = response.data;
    
    // Transform new API response to SearchResult format and filter for Nigeria only
    const transformedResults: SearchResult[] = data.results.places
      .filter((place: MapSearchPlace) => {
        // Only include places within Nigeria boundaries
        const lat = place.coordinates.latitude;
        const lng = place.coordinates.longitude;
        return isWithinNigeria(lat, lng);
      })
      .map((place: MapSearchPlace) => ({
        place_id: place.id,
        display_name: place.name || place.display_name || place.address.full_address,
        lat: place.coordinates.latitude.toString(),
        lon: place.coordinates.longitude.toString(),
        type: place.classification.category[0] || place.classification.layer,
        category: place.classification.category.join(','),
        importance: place.relevance.similarity_score
      }));
    
    return transformedResults;
  } catch (error) {
    console.error('Search failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error.response?.status && error.response.status >= 500) {
        throw new Error('Search service is temporarily unavailable. Please try again later.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
    
    throw new Error('Search failed. Please try again.');
  }
}

/**
 * Reverse geocode coordinates to get place information using the new Ninja Map API
 * @param lat - Latitude
 * @param lon - Longitude
 * @param searchTerm - Optional search term to filter results
 * @returns Promise<{display: string, type?: string}>
 */
export async function reverseGeocode(lat: number, lon: number, searchTerm?: string): Promise<{
  length: number;display: string, type?: string
}> {
  // Check if coordinates are within Nigeria first
  if (!isWithinNigeria(lat, lon)) {
    console.log('Reverse geocoding attempted outside Nigeria, coordinates:', lat, lon);
    return { display: 'Location outside Nigeria', type: 'restricted' };
  }

  try {
    const params: any = {
      lat: lat,
      lon: lon
    };
    
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    
    const response = await axiosInstance.get('/api/map/reverse-geocoding', {
      params: params
    });

    const data = response.data;
    
    // Handle new API response format
    let display = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    let type: string | undefined;
    
    if (data && data.results && data.results.places && data.results.places.length > 0) {
      const place = data.results.places[0];
      display = place.name || place.display_name || place.address.full_address;
      type = place.classification.category[0] || place.classification.layer;
    }
    
    return { display, type };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Fallback to coordinates on error (only if within Nigeria)
    return { display: `${lat.toFixed(6)}, ${lon.toFixed(6)}` };
  }
}

export default {
  searchPlaces,
  reverseGeocode,
  transformMapSearchToSearchResult
};