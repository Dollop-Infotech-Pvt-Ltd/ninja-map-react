import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedTextarea, UnifiedInput } from "@/components/ui/unified-input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import { useEnhancedToast } from "@/hooks/use-enhanced-toast";
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  Compass,
  Target,
  Car,
  Bike,
  Bus,
  X,
  Volume2,
  VolumeX,
  Satellite,
  Map as MapIcon,
  Plus,
  Minus,
  Route,
  Navigation2,
  MapPinOff,
  Loader2,
  Sun,
  Moon,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Settings,
  Building,
  Coffee,
  Fuel,
  Hospital,
  School,
  ShoppingBag,
  Utensils,
  Box,
  AlertTriangle
} from "lucide-react";
import maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TILE_STYLES, NOMINATIM_SEARCH_URL, NOMINATIM_REVERSE_URL, VALHALLA_ROUTE_URL, VALHALLA_OPTIMIZED_ROUTE_URL } from "@/lib/APIConstants";

// Helper function to decode polyline
function decodePolyline(encoded: string): [number, number][] {
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
    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;
    coordinates.push([lng * 1e-5, lat * 1e-5]);
  }
  return coordinates;
}

// Polyline6 decoder for Valhalla shapes
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

function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 24) return remMin ? `${hours} hr ${remMin} min` : `${hours} hr`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  const parts: string[] = [];
  parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (remHours) parts.push(`${remHours} hr`);
  if (remMin) parts.push(`${remMin} min`);
  return parts.join(' ');
}

function formatDurationMs(ms: number): string {
  const minutes = Math.round(ms / 60000);
  return formatMinutes(minutes);
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  importance?: number;
}

interface RoutePoint {
  coordinates: [number, number];
  address: string;
}

interface MarkerDetails {
  coordinates: [number, number];
  address: string;
  name: string;
  type?: string;
}

interface DirectionStep {
  instruction: string;
  distance: number;
  time: number;
  sign: number;
}

interface RouteInfo {
  distance: string;
  time: number;
  instructions: any[];
  totalRoutes: number;
}

const mapStyles = TILE_STYLES;

// ESRI Satellite style definition with zoom limits
const esriSatelliteStyle: StyleSpecification = {
  version: 8 as 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '�� Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      minzoom: 0,
      maxzoom: 23
    }
  },
  layers: [
    {
      id: 'esri-satellite',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 23
    }
  ]
};

// Simple fallback style using OpenStreetMap tiles
const fallbackStyle: StyleSpecification = {
  version: 8 as 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};

// Route colors for multiple routes
const routeColors = [
  '#4285f4', // Google Blue
  '#ea4335', // Google Red
  '#34a853', // Google Green
  '#fbbc04', // Google Yellow
  '#9c27b0', // Purple
  '#ff9800', // Orange
  '#00bcd4', // Cyan
  '#795548', // Brown
];

// Map Component
function MapLibreMap({
  onMapLoad,
  userLocation,
  markerDetails,
  routePoints,
  routeGeometries,
  selectedRouteIndex,
  isDirectionsOpen,
  mapLayer,
  onMapClick,
  centerPoint,
  onRouteClick
}: {
  onMapLoad: (map: maplibregl.Map) => void;
  userLocation: [number, number] | null;
  destination: [number, number] | null;
  markerDetails: MarkerDetails | null;
  routePoints: RoutePoint[];
  routeGeometries: any[];
  selectedRouteIndex: number;
  isDirectionsOpen: boolean;
  mapLayer: string;
  onMapClick: (lng: number, lat: number) => void;
  centerPoint: [number, number] | null;
  onRouteClick: (index: number) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const detailsMarker = useRef<maplibregl.Marker | null>(null);
  const routeMarkers = useRef<maplibregl.Marker[]>([]);
  const routeLayers = useRef<{id: string, source: string}[]>([]);
  const currentStyleId = useRef<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      console.log('Initializing map...');
      console.log('Container element:', mapContainer.current);
      console.log('MapLibre GL version:', maplibregl.getVersion());
      
      // Check if the container exists
      if (!mapContainer.current) {
        console.error('Map container not found');
        return;
      }
      
      // Try to initialize map with vector style, fallback to simple style if needed
      let initialStyle = mapStyles.vector;
      console.log('Using initial style:', initialStyle);
      
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initialStyle,
        center: [3.3792, 6.5244], // Lagos, Nigeria
        zoom: 10,
        pitch: 0, // Initialize with 0 pitch (2D view)
        bearing: 0,
        maxZoom: 20,
        minZoom: 2,
        attributionControl: false,
      });
      
      currentStyleId.current = typeof initialStyle === 'string' ? initialStyle : 'initial';
      console.log('Map instance created:', map.current);
      
      // Map click handler for reverse geocoding
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
      
      // Map loading events
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        onMapLoad(map.current!);
      });
      
      map.current.on('error', (e) => {
        const err: any = e?.error;
        const name = err?.name || '';
        const msg = err?.message || '';
        // Ignore expected AbortError from tile/source cancellations
        if (name === 'AbortError' || msg.toLowerCase().includes('aborted')) {
          return;
        }
        console.error('Map error:', msg || 'Unknown map error');
        console.debug('Map error payload:', {
          type: e.type,
          target: e.target?.constructor?.name,
          name,
          message: msg || 'Unknown error'
        });
        // If there's a style loading/fetch error, try fallback
        if (err && (msg.includes('style') || msg.includes('fetch'))) {
          console.log('Style loading failed, trying fallback OSM style...');
          try {
            map.current?.setStyle(fallbackStyle);
            currentStyleId.current = 'fallback-osm';
          } catch (fallbackError) {
            console.error('Fallback style also failed:', fallbackError);
          }
        }
        console.log('Make sure TileServer GL is running at http://192.168.1.11:8080');
      });
      
      map.current.on('styledata', () => {
        console.log('Map style loaded');
      });
      
      map.current.on('styleimagemissing', (e) => {
        console.warn('Style image missing:', e.id);
      });
      
      map.current.on('dataloading', (e) => {
        // console.log('Data loading:', e.dataType || 'unknown');
      });
      
      map.current.on('sourcedataloading', (e) => {
        console.log('Source data loading:', e.sourceId);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    
    return () => {
      if (map.current) {
        try {
          console.log('Cleaning up map...');
          // Remove map instance
          map.current.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        } finally {
          map.current = null;
        }
      }
    };
  }, []);

  // Silence benign AbortError rejections from tile/source cancellations
  useEffect(() => {
    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason;
      const name = reason?.name || '';
      const msg = (typeof reason === 'string' ? reason : reason?.message) || '';
      if (name === 'AbortError' || msg.toLowerCase().includes('aborted')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, []);

  // Update map style when layer changes
  useEffect(() => {
    if (map.current) {
      try {
        // Always keep proper maxZoom per layer
        if (mapLayer === 'satellite') {
          map.current.setMaxZoom(18);
        } else {
          map.current.setMaxZoom(20);
        }
        // Determine desired style id and value
        let desiredId: string | null = null;
        let desiredStyle: any = null;
        if (mapLayer === 'satellite') {
          desiredId = 'satellite-esri';
          desiredStyle = esriSatelliteStyle;
        } else {
          const styleUrl = mapStyles[mapLayer as keyof typeof mapStyles];
          if (styleUrl) {
            desiredId = styleUrl;
            desiredStyle = styleUrl;
          } else {
            console.warn('Unknown map layer:', mapLayer);
          }
        }
        // Only call setStyle if the style actually changes
        if (desiredId && currentStyleId.current !== desiredId && desiredStyle) {
          console.log('Switching to style:', mapLayer, desiredId);
          map.current.setStyle(desiredStyle);
          currentStyleId.current = desiredId;
        }
      } catch (error) {
        console.error('Error updating map style:', error);
        // Fallback to vector style, then to simple OSM style if needed
        try {
          console.log('Trying vector style fallback...');
          map.current.setStyle(mapStyles.vector);
          currentStyleId.current = mapStyles.vector;
        } catch (fallbackError) {
          console.error('Vector style fallback failed, trying simple OSM...', fallbackError);
          try {
            map.current.setStyle(fallbackStyle);
            currentStyleId.current = 'fallback-osm';
          } catch (simpleFallbackError) {
            console.error('All fallback styles failed:', simpleFallbackError);
          }
        }
      }
    }
  }, [mapLayer]);

  // Center map on specific point
  useEffect(() => {
    if (map.current && centerPoint) {
      try {
        map.current.flyTo({
          center: [centerPoint[1], centerPoint[0]],
          zoom: 15,
          duration: 1000
        });
      } catch (error) {
        console.warn('Error centering map:', error);
      }
    }
  }, [centerPoint]);

  // User location marker
  useEffect(() => {
    if (!map.current) return;
    if (userLocation) {
      if (userMarker.current) {
        userMarker.current.remove();
      }
      
      // Beautiful user location marker
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #4285f4; 
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -8px;
            left: -8px;
            width: 36px;
            height: 36px;
            background: rgba(66, 133, 244, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `;
      
      userMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation[1], userLocation[0]])
        .addTo(map.current);
    } else if (userMarker.current) {
      userMarker.current.remove();
      userMarker.current = null;
    }
  }, [userLocation]);

  // Details marker (clicked location)
  useEffect(() => {
    if (!map.current) return;
    if (markerDetails) {
      if (detailsMarker.current) {
        detailsMarker.current.remove();
      }
      
      // Beautiful details marker
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 24px; 
          height: 24px; 
          background: linear-gradient(135deg, #ea4335, #d33b2c); 
          border-radius: 50% 50% 50% 0;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          position: relative;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">📍</div>
        </div>
      `;
      
      detailsMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([markerDetails.coordinates[1], markerDetails.coordinates[0]])
        .addTo(map.current);
    } else if (detailsMarker.current) {
      detailsMarker.current.remove();
      detailsMarker.current = null;
    }
  }, [markerDetails]);

  // Route visualization
  useEffect(() => {
    if (!map.current) return;
    
    try {
      // Clear existing route markers
      routeMarkers.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          console.warn('Error removing route marker:', e);
        }
      });
      routeMarkers.current = [];
      
      // Clear existing route layers (remove layers first, then sources)
      try {
        const layersToRemove = routeLayers.current.map(({ id }) => id);
        const sourcesToRemove = Array.from(new Set(routeLayers.current.map(({ source }) => source)));
        layersToRemove.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.removeLayer(layerId);
          }
        });
        sourcesToRemove.forEach((sourceId) => {
          if (map.current?.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        });
      } catch (e) {
        console.warn('Error cleaning up route layers/sources:', (e as Error)?.message || e);
      } finally {
        routeLayers.current = [];
      }
      
      // Add route point markers with beautiful styling
      routePoints.forEach((point, index) => {
        try {
          const el = document.createElement('div');
          const isStart = index === 0;
          const isEnd = index === routePoints.length - 1;
          const isWaypoint = !isStart && !isEnd;
          
          el.innerHTML = `
            <div style="
              width: ${isStart || isEnd ? '28px' : '24px'}; 
              height: ${isStart || isEnd ? '28px' : '24px'}; 
              background: ${isStart ? 'linear-gradient(135deg, #4285f4, #1a73e8)' : 
                         isEnd ? 'linear-gradient(135deg, #ea4335, #d33b2c)' : 
                         'linear-gradient(135deg, #34a853, #0f9d58)'}; 
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${isStart || isEnd ? '12px' : '10px'};
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              ${isStart ? 'A' : isEnd ? String.fromCharCode(65 + routePoints.length - 1) : index + 1}
              ${isWaypoint ? '<div style="position: absolute; bottom: -6px; width: 4px; height: 4px; background: white; border-radius: 50%;"></div>' : ''}
            </div>
          `;
          
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([point.coordinates[1], point.coordinates[0]])
            .addTo(map.current!);
          
          routeMarkers.current.push(marker);
        } catch (e) {
          console.warn('Error adding route marker:', e);
        }
      });
      
      // Add all routes; blur/mute alternates, highlight selected
      if (routeGeometries.length > 0) {
        const selectedIdx = Math.min(Math.max(selectedRouteIndex, 0), routeGeometries.length - 1);
        const mainColor = routeColors[selectedIdx % routeColors.length];

        // First add all alternate routes (so selected can be drawn on top later)
        routeGeometries.forEach((geometry, i) => {
          if (i === selectedIdx) return;
          const sourceId = `route-${i}`;
          const layerId = `route-${i}`;
          const shadowLayerId = `route-shadow-${i}`;

          // Add source
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: geometry
          });

          // Soft shadow
          map.current!.addLayer({
            id: shadowLayerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#000000',
              'line-width': 6,
              'line-opacity': 0.25,
              'line-blur': 1.5,
              'line-translate': [0, 1]
            }
          });

          // Muted/blurred alternate route
          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': mainColor,
              'line-width': 4,
              'line-opacity': 0.35,
              'line-blur': 1.2,
              'line-dasharray': [1.5, 1.5]
            }
          });

          map.current!.on('click', layerId, () => onRouteClick(i));
          map.current!.on('mouseenter', layerId, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
          map.current!.on('mouseleave', layerId, () => { map.current!.getCanvas().style.cursor = ''; });

          routeLayers.current.push({ id: shadowLayerId, source: sourceId });
          routeLayers.current.push({ id: layerId, source: sourceId });
        });

        // Then add the selected route with vivid color and crisp line
        const geometry = routeGeometries[selectedIdx];
        const sourceId = `route-${selectedIdx}`;
        const layerId = `route-${selectedIdx}`;
        const shadowLayerId = `route-shadow-${selectedIdx}`;
        const color = mainColor;

        map.current!.addSource(sourceId, { type: 'geojson', data: geometry });

        map.current!.addLayer({
          id: shadowLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#000000',
            'line-width': 8,
            'line-opacity': 0.35,
            'line-blur': 2,
            'line-translate': [0, 1]
          }
        });

        map.current!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': color,
            'line-width': 6,
            'line-opacity': 1,
            'line-blur': 0
          }
        });

        map.current!.on('click', layerId, () => onRouteClick(selectedIdx));
        map.current!.on('mouseenter', layerId, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
        map.current!.on('mouseleave', layerId, () => { map.current!.getCanvas().style.cursor = ''; });

        routeLayers.current.push({ id: shadowLayerId, source: sourceId });
        routeLayers.current.push({ id: layerId, source: sourceId });
      }
      
      // Fit bounds to show entire route
      try {
        const selected = routeGeometries[selectedRouteIndex];
        if (selected && selected.geometry && Array.isArray(selected.geometry.coordinates) && selected.geometry.coordinates.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          selected.geometry.coordinates.forEach(([lng, lat]: [number, number]) => bounds.extend([lng, lat]));
          map.current.fitBounds(bounds, {
            padding: isDirectionsOpen ? { top: 80, right: 80, bottom: 80, left: 560 } : 100,
            duration: 900
          });
        } else if (routePoints.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          routePoints.forEach(point => bounds.extend([point.coordinates[1], point.coordinates[0]]));
          map.current.fitBounds(bounds, { padding: 100, duration: 900 });
        }
      } catch (e) {
        console.warn('Error fitting bounds:', e);
      }
    } catch (error) {
      console.warn('Error in route visualization:', error);
    }
  }, [routePoints, routeGeometries, selectedRouteIndex, onRouteClick, isDirectionsOpen]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full bg-muted/20"
      style={{ minHeight: '400px' }}
    />
  );
}

export default function Map() {
  const { theme, setTheme, isDark } = useTheme();
  const toast = useEnhancedToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState("car");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState("vector");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [markerDetails, setMarkerDetails] = useState<MarkerDetails | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSelectingWaypointFromMap, setIsSelectingWaypointFromMap] = useState(false);
  // Ref to hold latest handler so map click listener isn't stale
  const onMapClickRef = useRef<(lng: number, lat: number) => void | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeGeometries, setRouteGeometries] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [directionSteps, setDirectionSteps] = useState<DirectionStep[]>([]);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [centerPoint, setCenterPoint] = useState<[number, number] | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [isVoiceNavigationEnabled, setIsVoiceNavigationEnabled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startPointResults, setStartPointResults] = useState<SearchResult[]>([]);
  const [endPointResults, setEndPointResults] = useState<SearchResult[]>([]);
  const [isStartPointSearching, setIsStartPointSearching] = useState(false);
  const [isEndPointSearching, setIsEndPointSearching] = useState(false);
  const [selectedStartPoint, setSelectedStartPoint] = useState<SearchResult | null>(null);
  const [selectedEndPoint, setSelectedEndPoint] = useState<SearchResult | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [is3DView, setIs3DView] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [waypoints, setWaypoints] = useState<SearchResult[]>([]);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [waypointSearchQuery, setWaypointSearchQuery] = useState("");
  const [waypointSearchResults, setWaypointSearchResults] = useState<SearchResult[]>([]);
  const [isWaypointSearching, setIsWaypointSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [modeSummaries, setModeSummaries] = useState<Record<string, { timeMs: number; distanceM: number }>>({});

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const startPointSearchTimeoutRef = useRef<NodeJS.Timeout>();
  const endPointSearchTimeoutRef = useRef<NodeJS.Timeout>();
  const waypointSearchTimeoutRef = useRef<NodeJS.Timeout>();
  const autoRouteTimeoutRef = useRef<NodeJS.Timeout>();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Skip flags to prevent triggering search API after selecting from suggestions
  const skipStartSearchRef = useRef(false);
  const skipEndSearchRef = useRef(false);
  const skipWaypointSearchRef = useRef(false);
  
  // Fixed transport modes with Valhalla costings
  const transportModes = [
    { id: "car", icon: Car, label: "Car", profile: "auto", color: "#4285f4" },
    { id: "bike", icon: Bike, label: "Bicycle", profile: "bicycle", color: "#34a853" },
    { id: "foot", icon: Navigation, label: "Walk", profile: "pedestrian", color: "#fbbc04" },
    { id: "bus", icon: Bus, label: "Bus", profile: "bus", color: "#8a2be2" },
    { id: "motorcycle", icon: Car, label: "Motorcycle", profile: "motorcycle", color: "#ff6b6b" },
  ];
  
  // Voice navigation functions
  const speakInstruction = useCallback((instruction: string) => {
    if ('speechSynthesis' in window && isVoiceNavigationEnabled) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      utterance.pitch = 1;
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [isVoiceNavigationEnabled]);
  
  // Valhalla routing with JSON body
  const calculateRoute = useCallback(async (points: RoutePoint[], modeId?: string) => {
    if (points.length < 2) return;

    setIsRouting(true);
    setRouteError(null);
    setAvailableRoutes([]);
    setRouteGeometries([]);
    try {
      const selectedMode = transportModes.find(mode => mode.id === (modeId ?? selectedTransport));
      const costing = selectedMode?.profile || 'auto';

      const allowAlternatives = points.length === 2;
      const locations = points.map(p => ({ lat: p.coordinates[0], lon: p.coordinates[1], type: 'break', name: p.address }));

      const body = {
        locations,
        costing,
        directions_options: { units: 'kilometers' },
        alternates: allowAlternatives ? 2 : 0
      } as any;

      console.log(`Calculating route with costing: ${costing}`);
      console.log('Route body:', body);

      const url = `${VALHALLA_ROUTE_URL}?json=${encodeURIComponent(JSON.stringify(body))}`;
      const response = await fetch(url, { method: 'GET' });
      let data: any;
      
      if (!response.ok) {
        let errorText = 'Unknown error';
        let errorJson: any = null;
        try {
          const text = await response.text();
          errorText = text;
          try { errorJson = JSON.parse(text); } catch {}
        } catch (e) {
          console.warn('Could not read error response:', e);
        }
        console.error('Routing error response:', errorText);
        const ghMessage: string = errorJson?.message || errorText;
        const ghHints: any[] = Array.isArray(errorJson?.hints) ? errorJson.hints : [];
        const distanceExceeded =
          (typeof ghMessage === 'string' && ghMessage.toLowerCase().includes('too far from point')) ||
          ghHints.some((h: any) => String(h?.details || '').includes('PointDistanceExceededException'));
        if (distanceExceeded) {
          const human = 'Selected points are too far apart. Try adding an intermediate waypoint or choose closer points.';
          setRouteError(human);
          setAvailableRoutes([]);
          setRouteGeometries([]);
          setRouteInfo(null);
          setDirectionSteps([]);
          toast.error('Points too far apart', 'Please add waypoints or pick closer locations.');
          return;
        }
        throw new Error(`Routing failed: ${response.status} ${response.statusText}`);
      } else {
        data = await response.json();
        console.log('Route data received:', data);
      }
      
      const maneuversToSign = (type: number) => {
        if (type === 8 || type === 9) return -2; // left
        if (type === 10 || type === 11) return 2; // right
        if (type === 15) return 4; // roundabout
        return 0; // continue/default
      };

      const trips: any[] = [];
      if (data?.trip) {
        trips.push(data.trip);
      }
      if (Array.isArray(data?.alternates)) {
        data.alternates.forEach((alt: any) => {
          if (alt?.trip) trips.push(alt.trip);
        });
      }

      if (trips.length > 0) {
        const routes = trips.map((trip) => {
          const summary = trip?.summary || {};
          const timeSec = Number(summary.time ?? 0);
          const lengthKm = Number(summary.length ?? 0);

          // Collect maneuvers from all legs
          const legs = Array.isArray(trip?.legs) ? trip.legs : [];
          const steps: DirectionStep[] = [];
          legs.forEach((leg: any) => {
            const mans = Array.isArray(leg?.maneuvers) ? leg.maneuvers : [];
            mans.forEach((m: any) => {
              steps.push({
                instruction: m?.instruction || 'Continue',
                distance: typeof m?.length === 'number' ? m.length * 1000 : 0,
                time: typeof m?.time === 'number' ? m.time * 1000 : 0,
                sign: maneuversToSign(Number(m?.type ?? 0))
              });
            });
          });

          // Decode geometry
          let coords: [number, number][] = [];
          if (typeof trip?.shape === 'string') {
            coords = decodePolyline6(trip.shape).map(c => [c[0], c[1]]);
          } else if (legs.length > 0) {
            legs.forEach((leg: any) => {
              if (typeof leg?.shape === 'string') {
                const part = decodePolyline6(leg.shape).map((c) => [c[0], c[1]] as [number, number]);
                coords.push(...part);
              }
            });
          }

          const geometry = {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords as any }
          };

          return {
            distance: lengthKm * 1000,
            time: timeSec * 1000,
            instructions: steps,
            geometry
          };
        });

        // Sort by time asc
        routes.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
        setAvailableRoutes(routes);
        setSelectedRouteIndex(0);

        const selected = routes[0];
        setRouteInfo({
          distance: (selected.distance / 1000).toFixed(1),
          time: Math.round(selected.time / 60000),
          instructions: selected.instructions || [],
          totalRoutes: routes.length
        });

        setDirectionSteps(selected.instructions || []);
        if (isVoiceNavigationEnabled && selected.instructions.length > 0) {
          speakInstruction(selected.instructions[0].instruction);
        }

        setRouteGeometries(routes.map(r => r.geometry));

        try {
          const summaries = await Promise.all(
            transportModes.map(async (m) => {
              try {
                const b = {
                  locations,
                  costing: m.profile,
                  directions_options: { units: 'kilometers' }
                };
                const url2 = `${VALHALLA_ROUTE_URL}?json=${encodeURIComponent(JSON.stringify(b))}`;
                const resp = await fetch(url2, { method: 'GET' });
                if (!resp.ok) return { id: m.id, timeMs: Number.NaN, distanceM: Number.NaN };
                const d = await resp.json();
                const trip = d?.trip;
                const sum = trip?.summary;
                if (!sum) return { id: m.id, timeMs: Number.NaN, distanceM: Number.NaN };
                return { id: m.id, timeMs: Number(sum.time) * 1000, distanceM: Number(sum.length) * 1000 };
              } catch {
                return { id: m.id, timeMs: Number.NaN, distanceM: Number.NaN };
              }
            })
          );
          const map: Record<string, { timeMs: number; distanceM: number }> = {};
          summaries.forEach((s) => {
            if (s) map[s.id] = { timeMs: s.timeMs, distanceM: s.distanceM };
          });
          setModeSummaries(map);
        } catch (e) {
          console.warn('Failed to fetch mode summaries', e);
        }
      } else {
        console.warn('No route found in response');
      }
    } catch (error) {
      console.error('Routing failed:', error);

      // Fallback to straight line if routing fails (except specific handled cases)
      if (routeError) {
        return;
      }
      const start = points[0];
      const end = points[points.length - 1];

      const geometry = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [start.coordinates[1], start.coordinates[0]],
            [end.coordinates[1], end.coordinates[0]]
          ]
        }
      };
      
      setRouteGeometries([geometry]);
      setRouteInfo({
        distance: 'Unknown',
        time: 0,
        instructions: [],
        totalRoutes: 1
      });
      toast.warning('Using straight-line preview', 'Route calculation failed; showing an approximate line between points.');
    } finally {
      setIsRouting(false);
    }
  }, [selectedTransport, transportModes, selectedRouteIndex, isVoiceNavigationEnabled, speakInstruction]);
  
  // Handle transport mode change - recalculate route
  const handleTransportModeChange = useCallback((newMode: string) => {
    setSelectedTransport(newMode);
    setSelectedRouteIndex(0);
    setRouteError(null);
    setIsRouting(true);
    setAvailableRoutes([]);
    setRouteGeometries([]);
    if (routePoints.length >= 2) {
      calculateRoute(routePoints, newMode);
    } else {
      setIsRouting(false);
    }
  }, [routePoints, calculateRoute]);
  
  const LAYER_PREVIEW = "https://cdn.builder.io/api/v1/image/assets%2Fe2371b11d83c44f2b44d6a6528adf130%2Fdf529bd313c6405cabab1f313bd147b9?format=webp&width=800";

  const mapLayers = [
    {
      id: "vector",
      name: "OSM Bright",
      icon: MapIcon,
      description: "Road map",
      preview: LAYER_PREVIEW
    },
    {
      id: "klokantech",
      name: "Basic",
      icon: MapIcon,
      description: "Basic style",
      preview: LAYER_PREVIEW
    },
    {
      id: "dark",
      name: "Dark",
      icon: MapIcon,
      description: "Dark style",
      preview: LAYER_PREVIEW
    },
    {
      id: "elevated",
      name: "Elevated",
      icon: MapIcon,
      description: "Elevated style",
      preview: LAYER_PREVIEW
    },
    {
      id: "satellite",
      name: "Satellite",
      icon: Satellite,
      description: "ESRI Satellite",
      preview: LAYER_PREVIEW
    }
  ];
  
  const quickPlaces = [
    { name: "Restaurants", icon: Utensils, query: "restaurant near me" },
    { name: "Gas Stations", icon: Fuel, query: "gas station near me" },
    { name: "Hospitals", icon: Hospital, query: "hospital near me" },
    { name: "Shopping", icon: ShoppingBag, query: "shopping mall near me" },
    { name: "Coffee", icon: Coffee, query: "coffee shop near me" },
    { name: "Schools", icon: School, query: "school near me" },
  ];
  
  // Search with Nominatim - enhanced
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log(`${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`);
      
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`
      );
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      console.log('Make sure Nominatim is running at http://192.168.1.11:8080');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Search for start point
  const performStartPointSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setStartPointResults([]);
      return;
    }
    
    setIsStartPointSearching(true);
    
    try {
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`
      );
      
      const data = await response.json();
      setStartPointResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Start point search failed:', error);
      setStartPointResults([]);
    } finally {
      setIsStartPointSearching(false);
    }
  }, []);
  
  // Search for end point
  const performEndPointSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setEndPointResults([]);
      return;
    }
    
    setIsEndPointSearching(true);
    
    try {
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`
      );
      
      const data = await response.json();
      setEndPointResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('End point search failed:', error);
      setEndPointResults([]);
    } finally {
      setIsEndPointSearching(false);
    }
  }, []);
  
  // Search for waypoint
  const performWaypointSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setWaypointSearchResults([]);
      return;
    }
    
    setIsWaypointSearching(true);
    
    try {
      const response = await fetch(
        `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1&namedetails=1`
      );
      
      const data = await response.json();
      setWaypointSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Waypoint search failed:', error);
      setWaypointSearchResults([]);
    } finally {
      setIsWaypointSearching(false);
    }
  }, []);
  
  // Handle search result click
  const handleSearchResultClick = useCallback((result: SearchResult) => {
    const coordinates: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    setMarkerDetails({
      coordinates,
      address: result.display_name,
      name: result.display_name.split(',')[0],
      type: result.type || result.category
    });
    setCenterPoint(coordinates);
    setSearchResults([]);
    setSearchQuery("");
    
    // If we have a route with at least one point, add this as the destination
    if (routePoints.length === 1) {
      setIsDirectionsOpen(true);
      setUseCurrentLocation(false);
      setFromLocation(routePoints[0].address);
      setToLocation(result.display_name);
      
      // Create SearchResult objects for the form
      const startPoint: SearchResult = {
        place_id: `route-start-${Date.now()}`,
        display_name: routePoints[0].address,
        lat: routePoints[0].coordinates[0].toString(),
        lon: routePoints[0].coordinates[1].toString()
      };
      
      setSelectedStartPoint(startPoint);
      setSelectedEndPoint(result);
      
      // Add to route and calculate
      const newRoutePoints: RoutePoint[] = [...routePoints, {
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)] as [number, number],
        address: result.display_name
      }];
      setRoutePoints(newRoutePoints);
      calculateRoute(newRoutePoints);
    }
  }, [routePoints, calculateRoute]);
  
  // Handle start point selection
  const handleStartPointSelect = useCallback((result: SearchResult) => {
    // Prevent the start point debounced effect from re-querying when selecting a suggestion
    skipStartSearchRef.current = true;
    setSelectedStartPoint(result);
    setFromLocation(result.display_name);
    setStartPointResults([]);
  }, []);
  
  // Handle end point selection
  const handleEndPointSelect = useCallback((result: SearchResult) => {
    // Prevent the end point debounced effect from re-querying when selecting a suggestion
    skipEndSearchRef.current = true;
    setSelectedEndPoint(result);
    setToLocation(result.display_name);
    setEndPointResults([]);
  }, []);
  
  // Add waypoint to route
  const addWaypoint = useCallback((point: SearchResult) => {
    // Prevent waypoint search effect from firing when a suggestion is picked
    skipWaypointSearchRef.current = true;
    setWaypoints(prev => [...prev, point]);
    // Populate the waypoint input with the selected location
    setWaypointSearchQuery(point.display_name);
    // Keep the waypoint input visible so the user can edit/confirm
    setIsAddingWaypoint(true);
  }, []);
  
  // Remove waypoint
  const removeWaypoint = useCallback((index: number) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Move waypoint up
  const moveWaypointUp = useCallback((index: number) => {
    setWaypoints(prev => {
      if (index <= 0) return prev;
      const next = [...prev];
      const tmp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }, []);

  // Move waypoint down
  const moveWaypointDown = useCallback((index: number) => {
    setWaypoints(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const tmp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }, []);
  
  // Get user location - enhanced
  const triedLowAccuracyRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const watchTimeoutRef = useRef<number | null>(null);
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      console.error(msg);
      setLocationError(msg);
      return;
    }

    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [position.coords.latitude, position.coords.longitude];  
        setUserLocation(location);
        setCenterPoint(location);
        triedLowAccuracyRef.current = false;
        setLocationError(null);
      },
      (error) => {
        const insecureOrigin = location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname);
        let msg = error.message || 'Unable to get your location.';
        if (error.code === 1) msg = 'Permission denied. Please allow location access in your browser.';
        if (error.code === 2) msg = 'Location unavailable. Turn on GPS or check your network.';
        if (error.code === 3) msg = 'Location request timed out. Try again.';
        if (insecureOrigin) msg += ' Tip: Use HTTPS for precise location (browser restriction).';

        // Retry once with lower accuracy and longer timeout
        if (!triedLowAccuracyRef.current) {
          triedLowAccuracyRef.current = true;
          navigator.geolocation.getCurrentPosition(
            (p) => {
              const loc: [number, number] = [p.coords.latitude, p.coords.longitude];
              setUserLocation(loc);
              setCenterPoint(loc);
              triedLowAccuracyRef.current = false;
              setLocationError(null);
            },
            (e) => {
              console.warn('Error getting location:', e?.message || e);
              setLocationError(msg);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
          );
          return;
        }

        // As a last fallback, try a short watch for changing signals
        if (error.code === 2 || error.code === 3) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (p2) => {
              const loc2: [number, number] = [p2.coords.latitude, p2.coords.longitude];
              setUserLocation(loc2);
              setCenterPoint(loc2);
              if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
              if (watchTimeoutRef.current != null) window.clearTimeout(watchTimeoutRef.current);
              triedLowAccuracyRef.current = false;
              setLocationError(null);
            },
            () => {},
            { enableHighAccuracy: false, maximumAge: 600000 }
          );
          watchTimeoutRef.current = window.setTimeout(() => {
            if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
            setLocationError(msg);
          }, 15000);
          return;
        }

        console.warn('Error getting location:', error?.message || error);
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);
  
  // Handle map click with reverse geocoding
  const handleMapClick = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `${NOMINATIM_REVERSE_URL}?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      const data = await response.json();

      if (data.display_name) {
        setMarkerDetails({
          coordinates: [lat, lng],
          address: data.display_name,
          name: data.display_name.split(',')[0],
          type: data.type || data.category
        });

        // If user is selecting a waypoint from the map, add it as a waypoint
        if (isSelectingWaypointFromMap) {
          const result: SearchResult = {
            place_id: `map-waypoint-${Date.now()}`,
            display_name: data.display_name,
            lat: lat.toString(),
            lon: lng.toString(),
            type: data.type || data.category
          } as any;

          // Add waypoint and clear selection mode, keep input visible
          addWaypoint(result);
          setIsSelectingWaypointFromMap(false);
          setIsAddingWaypoint(true);
          toast?.success?.('Waypoint added', data.display_name.split(',')[0]);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      console.log('Make sure Nominatim is running at http://192.168.1.11:8080');
    }
  }, [isSelectingWaypointFromMap, addWaypoint, toast]);

  // Keep ref updated with latest handler
  useEffect(() => { onMapClickRef.current = handleMapClick; }, [handleMapClick]);
  
  // Add to route and auto-open directions
  const addToRoute = useCallback((point: MarkerDetails) => {
    const routePoint: RoutePoint = {
      coordinates: point.coordinates,
      address: point.address
    };
    
    const newRoutePoints = [...routePoints, routePoint];
    setRoutePoints(newRoutePoints);
    
    // Auto-open directions overlay when points are added
    if (newRoutePoints.length >= 2) {
      setIsDirectionsOpen(true);
      calculateRoute(newRoutePoints);
      
      // Auto-fill direction form with the first and last points
      setUseCurrentLocation(false);
      setFromLocation(newRoutePoints[0].address);
      setToLocation(newRoutePoints[newRoutePoints.length - 1].address);
      
      // Create SearchResult objects for the form
      const startPoint: SearchResult = {
        place_id: `route-start-${Date.now()}`,
        display_name: newRoutePoints[0].address,
        lat: newRoutePoints[0].coordinates[0].toString(),
        lon: newRoutePoints[0].coordinates[1].toString()
      };
      
      const endPoint: SearchResult = {
        place_id: `route-end-${Date.now()}`,
        display_name: newRoutePoints[newRoutePoints.length - 1].address,
        lat: newRoutePoints[newRoutePoints.length - 1].coordinates[0].toString(),
        lon: newRoutePoints[newRoutePoints.length - 1].coordinates[1].toString()
      };
      
      setSelectedStartPoint(startPoint);
      setSelectedEndPoint(endPoint);
    }
  }, [routePoints, calculateRoute]);
  
  // Handle directions - now just opens the panel
  const handleDirections = useCallback(() => {
    setIsMenuOpen(false);
    setShowLayerPanel(false);
    setIsDirectionsOpen(true);
    // If we have a marker selected, use it as the end point
    if (markerDetails) {
      setToLocation(markerDetails.address);
      setSelectedEndPoint({
        place_id: "selected",
        display_name: markerDetails.address,
        lat: markerDetails.coordinates[0].toString(),
        lon: markerDetails.coordinates[1].toString()
      });
      
      // If we have a route with at least one point, use it as start
      if (routePoints.length > 0) {
        setUseCurrentLocation(false);
        setFromLocation(routePoints[0].address);
        setSelectedStartPoint({
          place_id: `route-start-${Date.now()}`,
          display_name: routePoints[0].address,
          lat: routePoints[0].coordinates[0].toString(),
          lon: routePoints[0].coordinates[1].toString()
        });
        
        // Add to route and calculate if not already there
        if (!routePoints.some(p => 
          p.coordinates[0] === markerDetails.coordinates[0] && 
          p.coordinates[1] === markerDetails.coordinates[1]
        )) {
          const newRoutePoints = [...routePoints, {
            coordinates: markerDetails.coordinates,
            address: markerDetails.address
          }];
          setRoutePoints(newRoutePoints);
          calculateRoute(newRoutePoints);
        }
      } else if (userLocation) {
        // Use current location as start if no route points
        setUseCurrentLocation(true);
        setSelectedStartPoint(null);
        
        // Add to route and calculate
        const newRoutePoints = [{
          coordinates: userLocation,
          address: "Current Location"
        }, {
          coordinates: markerDetails.coordinates,
          address: markerDetails.address
        }];
        setRoutePoints(newRoutePoints);
        calculateRoute(newRoutePoints);
      }
    }
  }, [markerDetails, routePoints, userLocation, calculateRoute]);
  
  // Calculate route from entered points
  const calculateRouteFromPoints = useCallback(() => {
    const points: RoutePoint[] = [];
    
    // Add start point
    if (useCurrentLocation && userLocation) {
      points.push({
        coordinates: userLocation,
        address: "Current Location"
      });
    } else if (selectedStartPoint) {
      points.push({
        coordinates: [parseFloat(selectedStartPoint.lat), parseFloat(selectedStartPoint.lon)],
        address: selectedStartPoint.display_name
      });
    }
    
    // Add waypoints
    waypoints.forEach(waypoint => {
      points.push({
        coordinates: [parseFloat(waypoint.lat), parseFloat(waypoint.lon)],
        address: waypoint.display_name
      });
    });
    
    // Add end point
    if (selectedEndPoint) {
      points.push({
        coordinates: [parseFloat(selectedEndPoint.lat), parseFloat(selectedEndPoint.lon)],
        address: selectedEndPoint.display_name
      });
    }
    
    if (points.length >= 2) {
      setSelectedRouteIndex(0);
      setRoutePoints(points);
      calculateRoute(points);
    }
  }, [useCurrentLocation, userLocation, selectedStartPoint, waypoints, selectedEndPoint, calculateRoute]);
  
  // Handle route selection
  const selectRoute = useCallback((index: number) => {
    if (availableRoutes.length === 0) return;
    
    const newIndex = Math.min(index, availableRoutes.length - 1);
    setSelectedRouteIndex(newIndex);
    const selectedRoute = availableRoutes[newIndex];
    
    // Update route info
    setRouteInfo({
      distance: (selectedRoute.distance / 1000).toFixed(1),
      time: Math.round(selectedRoute.time / 60000),
      instructions: selectedRoute.instructions || [],
      totalRoutes: availableRoutes.length
    });
    
    // Process turn-by-turn directions
    if (selectedRoute.instructions) {
      const steps: DirectionStep[] = selectedRoute.instructions.map((inst: any) => ({
        instruction: inst.text || 'Continue',
        distance: inst.distance || 0,
        time: inst.time || 0,
        sign: inst.sign || 0
      }));
      setDirectionSteps(steps);
      
      if (isVoiceNavigationEnabled && steps.length > 0) {
        speakInstruction(steps[0].instruction);
      }
    }
  }, [availableRoutes, isVoiceNavigationEnabled, speakInstruction]);
  
  // Toggle voice navigation
  const toggleVoiceNavigation = useCallback(() => {
    setIsVoiceNavigationEnabled(!isVoiceNavigationEnabled);
    if (!isVoiceNavigationEnabled && directionSteps.length > 0) {
      speakInstruction(directionSteps[currentStepIndex]?.instruction || 'Navigation started');
    } else {
      window.speechSynthesis.cancel();
    }
  }, [isVoiceNavigationEnabled, directionSteps, currentStepIndex, speakInstruction]);
  
  // Optimize route via Valhalla optimized_route
  const optimizeRoute = useCallback(async () => {
    if (routePoints.length < 2) return;

    try {
      const locations = routePoints.map(p => ({ lat: p.coordinates[0], lon: p.coordinates[1], type: 'break', name: p.address }));
      const selectedMode = transportModes.find(mode => mode.id === selectedTransport);
      const costing = selectedMode?.profile || 'auto';

      const body = { locations, costing, directions_options: { units: 'kilometers' } };
      const url = `${VALHALLA_OPTIMIZED_ROUTE_URL}?json=${encodeURIComponent(JSON.stringify(body))}`;
      const resp = await fetch(url, { method: 'GET' });

      if (resp.ok) {
        const data = await resp.json();
        if (data?.trip) {
          const newPoints = Array.isArray(data.trip.locations)
            ? data.trip.locations.map((l: any) => ({
                coordinates: [Number(l.lat), Number(l.lon)] as [number, number],
                address: l.name || `${l.lat},${l.lon}`
              }))
            : routePoints;
          if (newPoints.length >= 2) {
            setRoutePoints(newPoints);
            await calculateRoute(newPoints);
            return;
          }
        }
      }
      await calculateRoute(routePoints);
    } catch (error) {
      console.error('Route optimization failed:', error);
    }
  }, [routePoints, selectedTransport, transportModes, calculateRoute]);
  
  // Map controls
  const zoomIn = useCallback(() => {
    if (map) map.zoomIn({ duration: 300 });
  }, [map]);
  
  const zoomOut = useCallback(() => {
    if (map) map.zoomOut({ duration: 300 });
  }, [map]);
  
  const resetNorth = useCallback(() => {
    if (map) {
      map.easeTo({
        bearing: 0,
        pitch: is3DView ? 45 : 0, // Keep current pitch but reset bearing
        duration: 500
      });
    }
  }, [map, is3DView]);
  
  // Reset map view to initial position and zoom
  const resetMapView = useCallback(() => {
    if (map) {
      map.flyTo({
        center: [3.3792, 6.5244], // Lagos, Nigeria (initial center)
        zoom: 10,                 // Initial zoom level
        pitch: 0,                 // Reset to 2D view
        bearing: 0,               // Reset bearing
        duration: 1000
      });
      setIs3DView(false); // Reset 3D state
    }
  }, [map]);
  
  // Track map bearing to rotate compass icon
  useEffect(() => {
    if (!map) return;
    const updateBearing = () => {
      try {
        setMapBearing(map.getBearing());
      } catch {}
    };
    updateBearing();
    map.on('rotate', updateBearing);
    map.on('move', updateBearing);
    return () => {
      try {
        map.off('rotate', updateBearing);
        map.off('move', updateBearing);
      } catch {}
    };
  }, [map]);

  // Toggle 3D view
  const toggle3DView = useCallback(() => {
    if (map) {
      const newPitch = is3DView ? 0 : 45; // Toggle between 0 (2D) and 45 (3D)
      map.easeTo({
        pitch: newPitch,
        duration: 1000
      });
      setIs3DView(!is3DView);
    }
  }, [map, is3DView]);
  
  // Clear everything
  const clearAll = useCallback(() => {
    setDestination(null);
    setMarkerDetails(null);
    setRouteInfo(null);
    setRoutePoints([]);
    setRouteGeometries([]);
    setDirectionSteps([]);
    setAvailableRoutes([]);
    setSelectedRouteIndex(0);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setIsDirectionsOpen(false);
    setIsVoiceNavigationEnabled(false);
    setSearchQuery("");
    setFromLocation("");
    setToLocation("");
    setStartPointResults([]);
    setEndPointResults([]);
    setSelectedStartPoint(null);
    setSelectedEndPoint(null);
    setUseCurrentLocation(true);
    setIs3DView(false); // Reset 3D state
    setWaypoints([]);
    setIsAddingWaypoint(false);
    setWaypointSearchQuery("");
    setWaypointSearchResults([]);
  
    // Stop any active speech
    window.speechSynthesis.cancel();
  }, []);
  
  // Handle directions overlay dismissal
  const handleDirectionsDismiss = useCallback(() => {
    setIsDirectionsOpen(false);
    // Clear route when directions are dismissed
    setRoutePoints([]);
    setRouteGeometries([]);
    setRouteInfo(null);
    setDirectionSteps([]);
    setAvailableRoutes([]);
    setSelectedRouteIndex(0);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setIsVoiceNavigationEnabled(false);
    setFromLocation("");
    setToLocation("");
    setStartPointResults([]);
    setEndPointResults([]);
    setSelectedStartPoint(null);
    setSelectedEndPoint(null);
    setUseCurrentLocation(true);
    setWaypoints([]);
    setIsAddingWaypoint(false);
    setWaypointSearchQuery("");
    setWaypointSearchResults([]);
    
    // Stop any active speech
    window.speechSynthesis.cancel();
  }, []);
  
  // Start navigation
  const startNavigation = useCallback(() => {
    if (routePoints.length >= 2) {
      setIsNavigating(true);
      setIsDirectionsOpen(false);
    }
  }, [routePoints]);
  
  // Get direction icon based on instruction
  const getDirectionIcon = (sign: number) => {
    switch (sign) {
      case 1: return ArrowUp;
      case 2: return ArrowRight;
      case -2: return ArrowLeft;
      case 4: return RotateCw;
      default: return ArrowUp;
    }
  };
  
  // Get place icon
  const getPlaceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'restaurant': case 'cafe': return Utensils;
      case 'hospital': case 'clinic': return Hospital;
      case 'school': case 'university': return School;
      case 'shop': case 'mall': return ShoppingBag;
      case 'hotel': case 'accommodation': return Building;
      case 'gas': case 'fuel': return Fuel;
      default: return MapPin;
    }
  };
  
  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);
  
  // Debounced start point search
  useEffect(() => {
    if (startPointSearchTimeoutRef.current) {
      clearTimeout(startPointSearchTimeoutRef.current);
    }
    
    startPointSearchTimeoutRef.current = setTimeout(() => {
      if (skipStartSearchRef.current) {
        // Clear the skip flag and do not perform a search when the value was set by a suggestion click
        skipStartSearchRef.current = false;
        return;
      }
      if (!useCurrentLocation) {
        performStartPointSearch(fromLocation);
      }
    }, 300);
    
    return () => {
      if (startPointSearchTimeoutRef.current) {
        clearTimeout(startPointSearchTimeoutRef.current);
      }
    };
  }, [fromLocation, performStartPointSearch, useCurrentLocation]);
  
  // Debounced end point search
  useEffect(() => {
    if (endPointSearchTimeoutRef.current) {
      clearTimeout(endPointSearchTimeoutRef.current);
    }
    
    endPointSearchTimeoutRef.current = setTimeout(() => {
      if (skipEndSearchRef.current) {
        skipEndSearchRef.current = false;
        return;
      }
      performEndPointSearch(toLocation);
    }, 300);
    
    return () => {
      if (endPointSearchTimeoutRef.current) {
        clearTimeout(endPointSearchTimeoutRef.current);
      }
    };
  }, [toLocation, performEndPointSearch]);
  
  // Debounced waypoint search
  useEffect(() => {
    if (waypointSearchTimeoutRef.current) {
      clearTimeout(waypointSearchTimeoutRef.current);
    }
    
    waypointSearchTimeoutRef.current = setTimeout(() => {
      if (skipWaypointSearchRef.current) {
        skipWaypointSearchRef.current = false;
        return;
      }
      if (isAddingWaypoint) {
        performWaypointSearch(waypointSearchQuery);
      }
    }, 300);
    
    return () => {
      if (waypointSearchTimeoutRef.current) {
        clearTimeout(waypointSearchTimeoutRef.current);
      }
    };
  }, [waypointSearchQuery, performWaypointSearch, isAddingWaypoint]);

  // Auto-calculate route when destination or waypoints change
  useEffect(() => {
    if (autoRouteTimeoutRef.current) {
      clearTimeout(autoRouteTimeoutRef.current);
    }
    autoRouteTimeoutRef.current = setTimeout(() => {
      const hasStart = useCurrentLocation ? true : !!selectedStartPoint;
      const hasEnd = !!selectedEndPoint;
      if (hasStart && hasEnd) {
        calculateRouteFromPoints();
      }
    }, 300);
    return () => {
      if (autoRouteTimeoutRef.current) {
        clearTimeout(autoRouteTimeoutRef.current);
      }
    };
  }, [
    useCurrentLocation,
    selectedStartPoint?.lat,
    selectedStartPoint?.lon,
    selectedEndPoint?.lat,
    selectedEndPoint?.lon,
    // React to add/remove or coordinate change of waypoints
    JSON.stringify(waypoints.map(w => `${w.lat},${w.lon}`))
  ]);

  // Handle keyboard events for search results
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchResults.length > 0) {
        setSearchResults([]);
        setSearchQuery("");
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchResults.length]);
  
  // Initialize geolocation on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);
  
  // Cleanup speech synthesis and geo watchers on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (watchTimeoutRef.current != null) window.clearTimeout(watchTimeoutRef.current);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background">
      {/* Floating Search - top-left (logo left, input center, directions right) */}
      <div className="absolute top-4 left-4 z-50 w-[min(90vw,28rem)]">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-brand text-white flex items-center justify-center shadow-sm">
              <MapPin className="h-4 w-4" />
            </div>
          </Link>

          <div className="relative flex-1">
            <div className="rounded-full overflow-hidden border border-border/40 bg-card/90 shadow-lg focus-within:ring-2 focus-within:ring-brand/20 transition-all duration-150">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 z-10" />

                <Input
                  placeholder="Search places"
                  className="h-12 w-full bg-transparent border-0 rounded-none pl-10 pr-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                    <div className="h-6 w-6 bg-transparent flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full bg-card/80 border border-border/40 flex items-center justify-center shadow-sm">
                        <Loader2 className="h-3 w-3 text-primary animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results dropdown anchored to input */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setSearchResults([]); setSearchQuery(""); }}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.09, ease: 'easeOut' }}
                    className="absolute left-0 top-full mt-2 bg-card/95 border border-border/50 rounded-b-full rounded-t-none shadow-xl z-50 max-h-64 overflow-y-auto w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {searchResults.map((result, index) => {
                      const IconComponent = getPlaceIcon(result.type);
                      return (
                        <motion.button
                          key={result.place_id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.06, delay: index * 0.015 }}
                          onClick={() => { handleSearchResultClick(result); setSearchResults([]); setSearchQuery(""); }}
                          className="w-full text-left p-3 border-b border-border/20 hover:bg-accent/10 transition-colors flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground line-clamp-2">{result.display_name.split(',')[0]}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{result.display_name.split(',').slice(1, 3).join(', ')}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Directions button as sibling to input */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setIsDirectionsOpen(true); setShowLayerPanel(false); }}
              className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center transition"
              title="Directions"
            >
              <Route className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Theme Toggle - top-right */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="h-9 w-9 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm flex items-center justify-center transition"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </motion.div>
        </Button>
      </div>

      {/* Compact Location Details Overlay */}
      <AnimatePresence>
        {markerDetails && !isDirectionsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-40 max-w-sm mx-auto"
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-lg shadow-lg border border-border/50 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {React.createElement(getPlaceIcon(markerDetails.type), { className: "h-4 w-4 text-primary" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {markerDetails.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {markerDetails.address}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setMarkerDetails(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    onClick={handleDirections}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    <Route className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addToRoute(markerDetails)}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCenterPoint(markerDetails.coordinates)}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MapPin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      
      {/* Directions Overlay */}
      <AnimatePresence>
        {isDirectionsOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.09, ease: 'easeOut' }}
            className="absolute top-20 left-4 z-50"
          >
            <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-4 w-128 max-h-[calc(100vh-5rem)] overflow-y-auto ring-1 ring-border/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Directions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDirectionsDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Start Point Input */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <Button
                      variant={useCurrentLocation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                      className="h-7 text-xs px-3 rounded-full flex items-center gap-1"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Current
                    </Button>
                      <span className="text-xs text-muted-foreground">or</span>
                    </div>
                    <div className="relative mt-1">
                      <UnifiedInput
                        placeholder="Enter start point"
                        className="pl-10 pr-4 text-sm rounded-full bg-popover/80"
                        value={fromLocation}
                        onChange={(val: string) => setFromLocation(val)}
                        disabled={useCurrentLocation}
                        icon={Search}
                      />
                      {isStartPointSearching && (
                        <Loader2 className="absolute right-3 top-4 transform -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Start Point Results */}
                <AnimatePresence>
                  {!useCurrentLocation && startPointResults.length > 0 && !(selectedStartPoint && selectedEndPoint) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto z-50"
                    >
                      {startPointResults.map((result, index) => {
                        const IconComponent = getPlaceIcon(result.type || result.category || '');
                        return (
                          <motion.button
                            key={result.place_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              handleStartPointSelect(result);
                              setStartPointResults([]);
                            }}
                            className="w-full text-left p-3 border-b border-border/20 hover:bg-accent/5 transition-colors duration-150 flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-foreground line-clamp-2">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {result.display_name.split(',').slice(1, 3).join(', ')}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Show selected start when there are no live results */}
                  {!useCurrentLocation && startPointResults.length === 0 && selectedStartPoint && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="w-full text-left p-2 border-b border-border/30 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {(() => { const IconComponent = getPlaceIcon(selectedStartPoint.type || selectedStartPoint.category || ''); return <IconComponent className="h-4 w-4 text-primary" /> })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground whitespace-normal">{selectedStartPoint.display_name.split(',')[0]}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{selectedStartPoint.display_name.split(',').slice(1,3).join(', ')}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedStartPoint(null); setFromLocation(''); }} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* End Point Input */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <UnifiedInput
                        placeholder="Enter destination"
                        className="pl-10 pr-4 text-sm rounded-full bg-popover/80"
                        value={toLocation}
                        onChange={(val: string) => setToLocation(val)}
                        icon={Search}
                      />
                      {isEndPointSearching && (
                        <Loader2 className="absolute right-3 top-4 transform -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* End Point Results */}
                <AnimatePresence>
                  {endPointResults.length > 0 && !(selectedStartPoint && selectedEndPoint) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto z-50"
                    >
                      {endPointResults.map((result, index) => {
                        const IconComponent = getPlaceIcon(result.type || result.category || '');
                        return (
                          <motion.button
                            key={result.place_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              handleEndPointSelect(result);
                              setEndPointResults([]);
                            }}
                            className="w-full text-left p-2 border-b border-border/30 hover:bg-accent/30 transition-colors duration-150 flex items-center gap-2"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-foreground truncate">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-muted-foreground truncate line-clamp-1">
                                {result.display_name.split(',').slice(1, 3).join(', ')}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Show selected end when there are no live results */}
                  {endPointResults.length === 0 && selectedEndPoint && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="w-full text-left p-2 border-b border-border/30 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {(() => { const IconComponent = getPlaceIcon(selectedEndPoint.type || selectedEndPoint.category || ''); return <IconComponent className="h-4 w-4 text-primary" /> })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground whitespace-normal">{selectedEndPoint.display_name.split(',')[0]}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{selectedEndPoint.display_name.split(',').slice(1,3).join(', ')}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedEndPoint(null); setToLocation(''); }} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Waypoints Section */}
              {waypoints.length > 0 && (
                <div className="mb-4">
                                    <div className="space-y-2">
                    {waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-6 mt-2 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1">
                          <UnifiedInput
                            placeholder={`Waypoint ${index + 1}`}
                            className="pl-10 pr-4 text-sm rounded-full bg-popover/80"
                            value={waypoint.display_name}
                            onChange={(val: string) => setWaypoints(prev => prev.map((w, i) => i === index ? { ...w, display_name: val } : w))}
                            icon={Search}
                            onFocus={() => {
                              setIsSelectingWaypointFromMap(true);
                              toast?.info?.('Select waypoint', 'Click on the map to pick a waypoint.');
                              setIsAddingWaypoint(false);
                            }}
                          />

                          <div className="mt-1 flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveWaypointUp(index)} title="Move up">
                              <ArrowUp className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveWaypointDown(index)} title="Move down">
                              <ArrowUp className="h-4 w-4 transform rotate-180" />
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setIsSelectingWaypointFromMap(true); toast?.info?.('Select waypoint', 'Click on the map to pick a waypoint.'); }} title="Pick from map">
                              <MapPin className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeWaypoint(index)} title="Remove">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add Waypoint Section */}
              {isAddingWaypoint ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <UnifiedInput
                          placeholder="Add waypoint"
                          className="pl-10 pr-4 text-sm rounded-full bg-popover/80"
                          value={waypointSearchQuery}
                          onChange={(val: string) => setWaypointSearchQuery(val)}
                          icon={Search}
                          onFocus={() => {
                            setIsSelectingWaypointFromMap(true);
                            toast?.info?.('Select waypoint', 'Click on the map to pick a waypoint.');
                          }}
                          onClick={() => {
                            setIsSelectingWaypointFromMap(true);
                            toast?.info?.('Select waypoint', 'Click on the map to pick a waypoint.');
                          }}
                        />

                        {isWaypointSearching && (
                          <Loader2 className="absolute right-3 top-4 transform -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                        )}
                        {isSelectingWaypointFromMap && (
                          <div className="mt-2 text-xs text-muted-foreground">Click on the map to place the waypoint, or type to search. Press Esc to cancel.</div>
                        )}
                      </div>
                    </div>

                    {/* Close button outside the input box */}
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        aria-label="Close waypoint input"
                        onClick={() => {
                          setIsAddingWaypoint(false);
                          setWaypointSearchQuery("");
                          setWaypointSearchResults([]);
                          setIsSelectingWaypointFromMap(false);
                        }}
                        className="h-8 w-8 rounded-xl bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted-foreground border border-border/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Waypoint search results */}
                  <AnimatePresence>
                    {waypointSearchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto z-50"
                      >
                        {waypointSearchResults.map((result, index) => {
                          const IconComponent = getPlaceIcon(result.type || result.category || '');
                          return (
                            <motion.button
                              key={result.place_id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => {
                                addWaypoint(result);
                                setWaypointSearchResults([]);
                                setIsAddingWaypoint(true);
                              }}
                              className="w-full text-left p-3 border-b border-border/20 hover:bg-accent/5 transition-colors duration-150 flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground line-clamp-2">
                                  {result.display_name.split(',')[0]}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {result.display_name.split(',').slice(1, 3).join(', ')}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingWaypoint(true);
                    setIsSelectingWaypointFromMap(true);
                    toast?.info?.('Select waypoint', 'Click on the map to pick a waypoint.');
                  }}
                  className="w-full h-10 text-sm mb-4 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Waypoint
                </Button>
              )}
              
              {/* Calculate Route Button */}
              <Button
                onClick={calculateRouteFromPoints}
                disabled={isRouting || ((useCurrentLocation ? false : !selectedStartPoint) || !selectedEndPoint)}
                className="w-full h-10 text-sm mb-4 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg"
              >
                {isRouting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Finding routes...
                  </>
                ) : (
                  <>
                    <Route className="h-3 w-3 mr-1" />
                    Calculate Route
                  </>
                )}
              </Button>
              
              {/* Transport Mode Selection */}
              <div className="mb-4">
                <div className="flex gap-2">
                  {transportModes.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={selectedTransport === mode.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleTransportModeChange(mode.id)}
                      className={`h-8 px-3 text-xs rounded-full ${selectedTransport===mode.id? 'bg-primary/10' : 'bg-popover/60'}`}
                      title={mode.label}
                    >
                      <mode.icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Route Options - Google Maps Style */}
              {isRouting && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Finding alternative routes...
                </div>
              )}
              {routeError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Routing issue</AlertTitle>
                  <AlertDescription>{routeError}</AlertDescription>
                </Alert>
              )}
              {availableRoutes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Suggested Routes</h4>
                  <div className="space-y-2">
                    {availableRoutes.map((route, index) => {
                      const isSelected = index === selectedRouteIndex;
                      const color = routeColors[index % routeColors.length];
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => selectRoute(index)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/50 shadow-sm' 
                              : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-medium">
                                {index === 0 ? 'Fastest route' : 
                                 index === 1 ? 'Alternative 1' : 
                                 `Alternative ${index}`}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDurationMs(route.time)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-muted-foreground">
                              {(route.distance / 1000).toFixed(1)} km
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Route Summary */}
              {routeInfo && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Route className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{routeInfo.distance} km</div>
                      <div className="text-xs text-muted-foreground">
                        {formatMinutes(routeInfo.time)}
                        {routeInfo.totalRoutes > 1 && ` • ${routeInfo.totalRoutes} routes available`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoiceNavigation}
                      className={`h-8 w-8 p-0 ${isVoiceNavigationEnabled ? 'bg-primary/20 text-primary' : ''}`}
                    >
                      {isVoiceNavigationEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={startNavigation}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      <Route className="h-3 w-3 mr-1" />
                      Start Navigation
                    </Button>
                    {/* <Button
                      variant="outline"
                      onClick={optimizeRoute}
                      size="sm"
                      className="h-8 text-xs px-2"
                      title="Optimize Route"
                    >
                      <RotateCw className="h-3 w-3" />
                    </Button> */}
                  </div>
                </div>
              )}
              
              {/* Turn-by-turn Directions */}
              {directionSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Turn-by-turn</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {directionSteps.slice(0, 10).map((step, index) => {
                      const IconComponent = getDirectionIcon(step.sign);
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                        >
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground">{step.instruction}</div>
                            {step.distance > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {step.distance > 1000 
                                  ? `${(step.distance / 1000).toFixed(1)} km`
                                  : `${Math.round(step.distance)} m`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layers Button */}
      <div className="absolute bottom-4 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => setShowLayerPanel((prev) => { const next = !prev; if (next) setIsDirectionsOpen(false); return next; })}
          className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center transition"
          title="Map style"
        >
          {showLayerPanel ? <X className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
        </Button>
      </div>

      {/* Layer Selection Overlay */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.09, ease: 'easeOut' }}
          className="absolute bottom-16 left-4 z-50 origin-bottom-left"
          >
            <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-2xl shadow-md p-3 w-64 origin-bottom-left overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Map styles</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowLayerPanel(false)} className="h-7 w-7 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 py-1">
                {mapLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => { setMapLayer(layer.id); setShowLayerPanel(false); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${mapLayer===layer.id ? 'bg-primary/10 border border-primary/50 shadow-sm' : 'bg-popover/60 border border-border/50 hover:bg-popover/80'}`}>
                    <div className="w-12 h-8 bg-muted/10 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img src={layer.preview || '/placeholder.svg'} alt={`${layer.name} preview`} className="h-full w-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.svg'}} />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{layer.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{layer.description}</div>
                    </div>

                    {mapLayer===layer.id && <div className="text-xs text-primary">Selected</div>}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">Preview of available base layers</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Controls - bottom-right */}
      <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-3 items-end">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" onClick={zoomIn} className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:scale-105 transition">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={zoomOut} className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:scale-105 transition">
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            onClick={resetNorth}
            className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:shadow-lg transition"
            title="Reset North"
          >
            <Compass className="h-4 w-4 transition-transform duration-200" style={{ transform: `rotate(${mapBearing}deg)` }} />
          </Button>

          <Button
            variant="ghost"
            onClick={getUserLocation}
            className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:shadow-lg transition"
            title="My location"
          >
            <Target className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={toggle3DView}
            className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:shadow-lg transition"
            title={is3DView ? "Switch to 2D" : "Switch to 3D"}
          >
            <Box className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={resetMapView}
            className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center hover:shadow-lg transition"
            title="Reset view"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {locationError && (
        <div className="absolute top-16 right-4 z-50 max-w-xs bg-destructive text-destructive-foreground border border-destructive rounded-md p-2 text-xs shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <div className="flex-1">{locationError}</div>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setLocationError(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Banner */}
      <AnimatePresence>
        {isNavigating && routeInfo && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute top-14 left-4 right-4 z-40"
          >
            <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg backdrop-blur-xl mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation2 className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Navigation Active</div>
                    <div className="text-xs opacity-90">
                      {routeInfo.distance} km • {formatMinutes(routeInfo.time)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6 p-0"
                  onClick={() => setIsNavigating(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Map Container */}
      <div className="absolute inset-0 w-full h-full">
        <MapLibreMap
          onMapLoad={setMap}
          userLocation={userLocation}
          destination={destination}
          markerDetails={markerDetails}
          routePoints={routePoints}
          routeGeometries={routeGeometries}
          selectedRouteIndex={selectedRouteIndex}
          isDirectionsOpen={isDirectionsOpen}
          mapLayer={mapLayer}
          onMapClick={(lng, lat) => onMapClickRef.current?.(lng, lat)}
          centerPoint={centerPoint}
          onRouteClick={selectRoute}
        />
      </div>
    </div>
  );
}
