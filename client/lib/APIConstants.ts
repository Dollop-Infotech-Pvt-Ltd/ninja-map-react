// export const TILE_STYLE_BASE = "http://192.168.1.161:8081";
export const TILE_STYLE_BASE = "https://tileserver.ninja-map.dollopinfotech.com";

// export const NOMINATIM_BASE = "http://192.168.1.161:8080";
export const NOMINATIM_BASE = "https://nominatim.ninja-map.dollopinfotech.com";


// export const VALHALLA_BASE = "http://192.168.1.161:8002";
export const VALHALLA_BASE = "https://valhalla.ninja-map.dollopinfotech.com";

export const TILE_STYLES = {
  vector: `${TILE_STYLE_BASE}/styles/osm-bright/style.json`,
  dark: `${TILE_STYLE_BASE}/styles/dark-matter/style.json`,
  elevated: `${TILE_STYLE_BASE}/styles/3d-map/style.json`,
  klokantech: `${TILE_STYLE_BASE}/styles/klokantech-basic/style.json`,
};

export const NOMINATIM_SEARCH_URL = `${NOMINATIM_BASE}/search`;
export const NOMINATIM_REVERSE_URL = `${NOMINATIM_BASE}/reverse`;

// New Map Search API - Use local proxy to avoid CORS issues
export const MAP_SEARCH_BASE = "";  // Use relative URL for proxy
export const MAP_SEARCH_URL = `/api/map/search`;
export const MAP_REVERSE_URL = `/api/map/reverse-geocoding`;

export const VALHALLA_ROUTE_URL = `${VALHALLA_BASE}/route`;
export const VALHALLA_OPTIMIZED_ROUTE_URL = `${VALHALLA_BASE}/optimized_route`;

// Grid API
export const GRID_API_BASE = "http://192.168.1.78:7002";
export const GRID_API_URL = `${GRID_API_BASE}/api/grid/polylines-with-codes`;

// Custom Routing API - New detailed routing service
export const CUSTOM_ROUTE_API_BASE = "http://192.168.1.95:7002";
export const CUSTOM_ROUTE_API_URL = `${CUSTOM_ROUTE_API_BASE}/api/map/route`;
