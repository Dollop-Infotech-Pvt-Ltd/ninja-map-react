export const TILE_STYLE_BASE = "http://192.168.1.161:8081";
export const NOMINATIM_BASE = "http://192.168.1.161:8080";
export const VALHALLA_BASE = "http://192.168.1.161:8002";

export const TILE_STYLES = {
  vector: `${TILE_STYLE_BASE}/styles/osm-bright/style.json`,
  dark: `${TILE_STYLE_BASE}/styles/dark-matter/style.json`,
  elevated: `${TILE_STYLE_BASE}/styles/3d-map/style.json`,
  klokantech: `${TILE_STYLE_BASE}/styles/klokantech-basic/style.json`,
};

export const NOMINATIM_SEARCH_URL = `${NOMINATIM_BASE}/search`;
export const NOMINATIM_REVERSE_URL = `${NOMINATIM_BASE}/reverse`;

export const VALHALLA_ROUTE_URL = `${VALHALLA_BASE}/route`;
export const VALHALLA_OPTIMIZED_ROUTE_URL = `${VALHALLA_BASE}/optimized_route`;
