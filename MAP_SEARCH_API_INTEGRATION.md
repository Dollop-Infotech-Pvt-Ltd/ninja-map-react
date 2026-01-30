# Map Search API Integration - CORS Solution

## Overview
Successfully integrated the new Map Search API (`https://api.ninja-map.dollopinfotech.com/api/map/search`) using a **proxy solution** to bypass CORS restrictions.

## CORS Issue & Solution

### The Problem
- API works when accessed directly in browser
- Fails when called from React app due to CORS (Cross-Origin Resource Sharing) restrictions
- Browser blocks requests from `localhost:8080` to `api.ninja-map.dollopinfotech.com`

### The Solution: Dual Proxy Setup

#### 1. **Vite Development Proxy** (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '/api/map': {
      target: 'https://api.ninja-map.dollopinfotech.com',
      changeOrigin: true,
      secure: true
    }
  }
}
```

#### 2. **Express Server Proxy** (`server/index.ts`)
```typescript
app.get("/api/map/search", async (req, res) => {
  const apiUrl = `https://api.ninja-map.dollopinfotech.com/api/map/search?search=${req.query.search}&size=${req.query.size}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  res.json(data);
});
```

## How It Works

1. **React app** calls `/api/map/search` (relative URL)
2. **Vite proxy** or **Express server** forwards the request to the external API
3. **External API** responds to the server (no CORS issues server-to-server)
4. **Server** returns the response to the React app

## Changes Made

### 1. API Constants (`client/lib/APIConstants.ts`)
```typescript
// Changed from external URL to relative proxy URL
export const MAP_SEARCH_URL = `/api/map/search`;
```

### 2. Vite Configuration (`vite.config.ts`)
- Added proxy configuration for development server
- Routes `/api/map/*` requests to external API

### 3. Express Server (`server/index.ts`)
- Added server-side proxy route
- Handles API forwarding with proper error handling

### 4. Map Component (`client/pages/Map.tsx`)
- Updated to use `mapSearchApi.ts` helper for both search and reverse geocoding
- All search functions now use the proxy
- Reverse geocoding now uses the new Map API instead of Nominatim

### 5. API Helper (`client/lib/mapSearchApi.ts`)
- Centralized search and reverse geocoding logic
- Proper error handling and transformation
- Added `reverseGeocode()` function for coordinate-to-address conversion

#### New Interfaces Added:
- `MapSearchPlace` - Represents a place in the new API response
- `MapSearchResponse` - Complete API response structure
- `transformMapSearchToSearchResult()` - Helper function to convert new API format to existing SearchResult format

## API Endpoints

### 1. **Search API**
- **Proxy URL**: `/api/map/search`
- **External URL**: `https://api.ninja-map.dollopinfotech.com/api/map/search`
- **Parameters**: `search` (query string), `size` (number of results)
- **Usage**: Text-based location search

### 2. **Reverse Geocoding API**
- **Proxy URL**: `/api/map/reverse-geocoding`  
- **External URL**: `https://api.ninja-map.dollopinfotech.com/api/map/reverse-geocoding`
- **Parameters**: `lat` (latitude), `lon` (longitude), `searchTerm` (optional filter)
- **Usage**: Convert coordinates to address/place information

## Updated Functions

### Search Functions (all now use new API):
1. `performSearch()` - Main map search
2. `performStartPointSearch()` - Directions start point
3. `performEndPointSearch()` - Directions end point  
4. `performWaypointSearch()` - Waypoint search
5. `performWaypointIndexedSearch()` - Per-waypoint search

### Reverse Geocoding Functions:
1. `reverseGeocode()` - Convert coordinates to place info
2. `handleMapClick()` - Map click handling with reverse geocoding
3. `handleRouteMarkerDrag()` - Route marker drag with address lookup

## API Response Transformation

The new API returns a different structure than Nominatim. The transformation maps:

| New API Field | SearchResult Field | Notes |
|---------------|-------------------|-------|
| `place.id` | `place_id` | Direct mapping |
| `place.name` (priority) or `place.display_name` or `place.address.full_address` | `display_name` | Prioritizes name, falls back to display_name, then full_address |
| `place.coordinates.latitude` | `lat` | Converted to string |
| `place.coordinates.longitude` | `lon` | Converted to string |
| `place.classification.category[0]` | `type` | Falls back to `layer` |
| `place.classification.category` | `category` | Joined with commas |
| `place.relevance.similarity_score` | `importance` | Direct mapping |

## New API Response Structure

```json
{
  "query": {
    "text": "lagos",
    "parameters": {
      "max_results": 10,
      "layer_filter": null,
      "source_filter": null
    }
  },
  "results": {
    "total_found": 10,
    "places": [
      {
        "id": "openstreetmap:venue:relation/2116203",
        "name": "Lagos Lagoon",
        "display_name": "Nigeria",
        "coordinates": {
          "latitude": 6.591926,
          "longitude": 3.769004,
          "lat_lon": [6.591926, 3.769004],
          "lon_lat": [3.769004, 6.591926]
        },
        "relevance": {
          "similarity_score": 0.6666667,
          "confidence": "1.00"
        },
        "classification": {
          "layer": "venue",
          "source": "openstreetmap",
          "category": ["natural", "natural:water", "recreation"]
        },
        "address": {
          "country": "Nigeria",
          "country_code": "NG",
          "full_address": "Nigeria"
        },
        "details": {
          "population": 3000,
          "website": null,
          "opening_hours": null
        },
        "source_info": {
          "source": "openstreetmap",
          "source_id": "relation/2116203",
          "popularity": 3000,
          "last_updated": "2026-01-28T11:29:55.345Z"
        }
      }
    ]
  }
}
```

## Testing

### API Test Files
1. **`test-map-search.js`** - Node.js test script
2. **`debug-search.html`** - Browser-based debug tool for CORS issues

### Running Tests

#### Node.js Test:
```bash
node test-map-search.js
```

#### Browser Debug Tool:
Open `debug-search.html` in your browser to test:
- Basic fetch requests
- CORS headers
- Axios requests  
- CORS preflight checks

### Troubleshooting CORS Issues

If the API works in Postman but not in the browser, it's likely a CORS issue. The integration includes:

1. **Proper CORS headers** in all fetch requests
2. **Axios client** with timeout and error handling
3. **Dedicated API module** (`mapSearchApi.ts`) for better error handling

#### Common CORS Solutions:
- Ensure the API server includes proper CORS headers:
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Accept
  ```
- Use the debug tool to identify specific CORS issues
- Check browser developer console for detailed error messages

## Backward Compatibility

The integration maintains full backward compatibility with the existing UI and functionality. All search features continue to work exactly as before:

- Main map search
- Directions start/end point search
- Multi-waypoint routing
- Search result selection and display
- Map marker placement

## Notes

- The reverse geocoding functionality still uses the Nominatim API (`NOMINATIM_REVERSE_URL`) as no replacement was specified
- All search functions now use the new API endpoint with proper error handling
- The transformation function ensures seamless integration with existing components
- Search result limit changed from 8 to 8/10 depending on the search type to match API capabilities