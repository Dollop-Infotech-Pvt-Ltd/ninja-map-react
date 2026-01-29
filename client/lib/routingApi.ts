import axios from 'axios';
import type { RouteRequest, RouteResponse, RouteManeuver } from '@shared/api';

// Use local proxy endpoint to avoid CORS issues
const ROUTING_API_URL = '/api/map/route';

// Create a dedicated axios instance for routing API
const routingClient = axios.create({
  timeout: 30000, // 30 seconds for routing requests
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
routingClient.interceptors.request.use(
  (config) => {
    console.log('Routing API Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Routing API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
routingClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Routing API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Transport mode to costing mapping
const TRANSPORT_COSTING_MAP: Record<string, string> = {
  'car': 'auto',
  'bike': 'bicycle',
  'motorbike': 'motorcycle',
  'foot': 'pedestrian'
};

// Maneuver type to instruction mapping for better UX
const MANEUVER_TYPE_MAP: Record<number, string> = {
  0: 'none',
  1: 'straight',
  2: 'start',
  3: 'start_right',
  4: 'start_left', 
  5: 'destination',
  6: 'destination_right',
  7: 'destination_left',
  8: 'slight_left',
  9: 'left',
  10: 'right',
  11: 'slight_right',
  12: 'continue',
  13: 'slight_right',
  14: 'sharp_left',
  15: 'sharp_right',
  16: 'uturn_left',
  17: 'uturn_right',
  18: 'sharp_right',
  19: 'ferry',
  20: 'roundabout_enter',
  21: 'roundabout_exit',
  22: 'stay_left',
  23: 'stay_right',
  24: 'merge',
  25: 'roundabout_enter',
  26: 'roundabout_exit'
};

// Helper function to decode polyline6 (Valhalla format)
function decodePolyline6(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  
  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;
    
    shift = 0;
    result = 0;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;
    
    coordinates.push([lng * 1e-6, lat * 1e-6]);
  }
  
  return coordinates;
}

// Helper function to get maneuver sign for UI
function getManeuverSign(type: number): number {
  switch (type) {
    case 8: // slight_left
    case 9: // left
    case 14: // sharp_left
    case 16: // uturn_left
      return -2;
    case 10: // right
    case 11: // slight_right
    case 15: // sharp_right
    case 17: // uturn_right
    case 18: // sharp_right
      return 2;
    case 20: // roundabout_enter
    case 21: // roundabout_exit
    case 25: // roundabout_enter
    case 26: // roundabout_exit
      return 4;
    case 24: // merge
      return 6;
    default:
      return 0; // continue/straight
  }
}

export interface RoutePoint {
  coordinates: [number, number];
  address: string;
}

export interface DirectionStep {
  instruction: string;
  distance: number;
  time: number;
  sign: number;
  coordinates?: [number, number];
  street_names?: string[];
  verbal_instruction?: string;
  maneuver_type?: string;
}

export interface RouteResult {
  distance: number; // in meters
  time: number; // in milliseconds
  instructions: DirectionStep[];
  geometry: {
    type: 'Feature';
    properties: {};
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
  };
}

/**
 * Calculate route using the new detailed routing API
 * @param points - Array of route points (start, waypoints, end)
 * @param transportMode - Transport mode ('car', 'bike', 'motorbike', 'foot')
 * @returns Promise<RouteResult[]> - Array of route alternatives
 */
export async function calculateRoute(
  points: RoutePoint[], 
  transportMode: string = 'car'
): Promise<RouteResult[]> {
  if (points.length < 2) {
    throw new Error('At least 2 points are required for routing');
  }

  const costing = TRANSPORT_COSTING_MAP[transportMode] || 'auto';
  
  // Build the route request
  const routeRequest: RouteRequest = {
    from: {
      lat: points[0].coordinates[0],
      lon: points[0].coordinates[1],
      search_term: points[0].address || '',
      search_radius: 5000
    },
    to: {
      lat: points[points.length - 1].coordinates[0],
      lon: points[points.length - 1].coordinates[1],
      search_term: points[points.length - 1].address || '',
      search_radius: 5000
    },
    costing,
    use_ferry: 0.0,
    ferry_cost: 300000
  };

  // Add waypoints if any
  if (points.length > 2) {
    routeRequest.via = points.slice(1, -1).map(point => ({
      lat: point.coordinates[0],
      lon: point.coordinates[1],
      search_term: point.address || '',
      search_radius: 3000
    }));
  }

  try {
    console.log('New Routing API Request URL:', ROUTING_API_URL);
    console.log('New Routing API Request Body:', routeRequest);
    
    const response = await routingClient.post<RouteResponse>(ROUTING_API_URL, routeRequest);
    
    console.log('New Routing API Response:', response.data);
    
    if (!response.data.trip) {
      throw new Error('No route found in response');
    }

    const trip = response.data.trip;
    
    // Process the route data
    const routes: RouteResult[] = [];
    
    // Decode the route geometry
    let coordinates: [number, number][] = [];
    
    // Combine all leg shapes
    if (trip.legs && trip.legs.length > 0) {
      trip.legs.forEach(leg => {
        if (leg.shape) {
          const legCoords = decodePolyline6(leg.shape);
          coordinates.push(...legCoords);
        }
      });
    }

    // Process maneuvers to create direction steps
    const instructions: DirectionStep[] = [];
    
    trip.legs.forEach(leg => {
      if (leg.maneuvers) {
        leg.maneuvers.forEach((maneuver: RouteManeuver) => {
          // Get coordinates for this maneuver
          let maneuverCoords: [number, number] | undefined;
          if (maneuver.begin_shape_index < coordinates.length) {
            const coord = coordinates[maneuver.begin_shape_index];
            maneuverCoords = [coord[1], coord[0]]; // Convert to [lat, lng]
          }

          instructions.push({
            instruction: maneuver.instruction,
            distance: maneuver.length * 1000, // Convert km to meters
            time: maneuver.time * 1000, // Convert seconds to milliseconds
            sign: getManeuverSign(maneuver.type),
            coordinates: maneuverCoords,
            street_names: maneuver.street_names,
            verbal_instruction: maneuver.verbal_pre_transition_instruction || maneuver.verbal_succinct_transition_instruction,
            maneuver_type: MANEUVER_TYPE_MAP[maneuver.type] || 'continue'
          });
        });
      }
    });

    // Create the route result
    const routeResult: RouteResult = {
      distance: trip.summary.length * 1000, // Convert km to meters
      time: trip.summary.time * 1000, // Convert seconds to milliseconds
      instructions,
      geometry: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    };

    routes.push(routeResult);
    
    return routes;
    
  } catch (error) {
    console.error('New routing API failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Route calculation timed out. Please try again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Routing service not found. Please check the API endpoint.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Routing service is temporarily unavailable. Please try again later.');
      }
      if (error.response?.status === 0 || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw new Error('Route calculation failed. Please try again.');
  }
}

export default {
  calculateRoute,
  decodePolyline6,
  getManeuverSign,
  TRANSPORT_COSTING_MAP,
  MANEUVER_TYPE_MAP
};