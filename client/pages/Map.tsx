import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UnifiedTextarea, UnifiedInput } from "@/components/ui/unified-input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import { useEnhancedToast } from "@/hooks/use-enhanced-toast";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { GridOverlay } from "@/components/GridOverlay";
// Import grid API test functions for browser console testing
import "@/lib/gridApiTest";
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  Compass,
  Target,
  Car,
  Bike,
  Motorbike,
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
  Footprints,
  School,
  ShoppingBag,
  Utensils,
  Box,
  AlertTriangle,
  Mountain,
  Grid3X3,
  ChevronRight,
  User,
  History,
  Link as LinkIcon,
  Info,
  LogOut,
  Menu
} from "lucide-react";
import maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TILE_STYLES, VALHALLA_ROUTE_URL, VALHALLA_OPTIMIZED_ROUTE_URL, CUSTOM_ROUTE_API_URL } from "@/lib/APIConstants";
import { searchPlaces, reverseGeocode, type SearchResult } from "@/lib/mapSearchApi";

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

function extractViaFromInstructions(instructions?: DirectionStep[]): string | undefined {
  if (!instructions || instructions.length === 0) return undefined;
  const patterns = [/onto\s+([^,\.]+)/i, /via\s+([^,\.]+)/i, /toward(?:s)?\s+([^,\.]+)/i, /on\s+([^,\.]+)/i];
  for (const instr of instructions) {
    if (!instr || !instr.instruction) continue;
    for (const p of patterns) {
      const m = instr.instruction.match(p);
      if (m && m[1]) {
        let v = m[1].trim();
        // Remove leading 'the'
        v = v.replace(/^the\s+/i, '');
        // Trim trailing words like 'road' or 'street' left as-is
        if (v.length > 0) return v;
      }
    }
  }
  return undefined;
}

function extractServerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  if (error && typeof error === 'object') {
    const candidates = [
      (error as Record<string, unknown>).message,
      (error as Record<string, unknown>).error,
      (error as Record<string, unknown>).error_description,
      (error as Record<string, unknown>).detail,
      (error as Record<string, unknown>).details,
      (error as Record<string, unknown>).reason
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return 'Unknown server error.';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  coordinates?: [number, number];
}

interface RouteInfo {
  distance: string;
  time: number;
  instructions: DirectionStep[];
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
  '#036A38', // Pantone Green
  '#1B8F55', // Green medium
  '#6FCF97', // Green light
  '#FFB81C', // Pantone 123 C Yellow
  '#F4C542', // Yellow light
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
  instructionPoint,
  onRouteClick,
  onRouteMarkerDrag,
  isDark,
  selectedTransport,
  walkingPaths
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
  instructionPoint: [number, number] | null;
  onRouteClick: (index: number) => void;
  onRouteMarkerDrag: (index: number, lat: number, lng: number) => void;
  isDark?: boolean;
  selectedTransport?: string;
  walkingPaths?: any[];
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const detailsMarker = useRef<maplibregl.Marker | null>(null);
  const routeMarkers = useRef<maplibregl.Marker[]>([]);
  const routeLayers = useRef<{id: string, source: string}[]>([]);
  const currentStyleId = useRef<string | null>(null);
  const instructionMarker = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      
      // Check if the container exists
      if (!mapContainer.current) {
        console.error('Map container not found');
        return;
      }
      
      // Try to initialize map with vector style, fallback to simple style if needed
      let initialStyle = mapStyles.vector;
      
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
      
      // Map click handler for reverse geocoding
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
      
      // Map loading events
      map.current.on('load', () => {
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
          try {
            map.current?.setStyle(fallbackStyle);
            currentStyleId.current = 'fallback-osm';
          } catch (fallbackError) {
            console.error('Fallback style also failed:', fallbackError);
          }
        }
      });
      
      map.current.on('styledata', () => {
        // Map style loaded
      });
      
      map.current.on('styleimagemissing', (e) => {
        console.warn('Style image missing:', e.id);
      });
      
      map.current.on('dataloading', (e) => {
        // console.log('Data loading:', e.dataType || 'unknown');
      });
      
      map.current.on('sourcedataloading', (e) => {
        // Source data loading
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    
    return () => {
      if (map.current) {
        try {
          if (instructionMarker.current) {
            instructionMarker.current.remove();
            instructionMarker.current = null;
          }
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
          map.current.setStyle(desiredStyle);
          currentStyleId.current = desiredId;
        }
      } catch (error) {
        console.error('Error updating map style:', error);
        // Fallback to vector style, then to simple OSM style if needed
        try {
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

  useEffect(() => {
    if (!map.current) return;
    if (instructionPoint) {
      if (!instructionMarker.current) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(3, 106, 56, 0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 6px rgba(3, 106, 56, 0.08);
          ">
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #036A38;
              box-shadow: 0 0 12px rgba(3, 106, 56, 0.45);
            "></div>
          </div>
        `;
        instructionMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' });
      }
      instructionMarker.current
        .setLngLat([instructionPoint[1], instructionPoint[0]])
        .addTo(map.current);
    } else if (instructionMarker.current) {
      instructionMarker.current.remove();
      instructionMarker.current = null;
    }
  }, [instructionPoint]);

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
          background: #036A38; 
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
            background: rgba(3, 106, 56, 0.2);
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
      
      // Details marker using custom pin image from public/mappin/map-pin.png
      const el = document.createElement('div');
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
      const img = document.createElement('img');
      img.src = '/mappin/map-pin.png';
      img.alt = 'Location pin';
      img.style.height = '72px';
      img.style.width = 'auto';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.style.imageRendering = 'auto';
      img.style.filter = isDark
        ? 'contrast(1.25) drop-shadow(0 8px 14px rgba(0,0,0,0.6))'
        : 'contrast(1.25) drop-shadow(0 8px 14px rgba(0,0,0,0.35))';
      el.appendChild(img);

      detailsMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
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
              background: ${isStart ? 'linear-gradient(135deg, #036A38, #025A30)' :
                         isEnd ? 'linear-gradient(135deg, #FFB81C, #D99A00)' :
                         'linear-gradient(135deg, #4b5563, #374151)'}; 
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
              ${isStart ? 'A' : isEnd ? 'B' : (index + 1)}
              ${isWaypoint ? '<div style="position: absolute; bottom: -6px; width: 4px; height: 4px; background: white; border-radius: 50%;"></div>' : ''}
            </div>
          `;
          
          const marker = new maplibregl.Marker({ element: el, draggable: true })
            .setLngLat([point.coordinates[1], point.coordinates[0]])
            .addTo(map.current!);

          marker.on('dragend', () => {
            try {
              const ll = marker.getLngLat();
              onRouteMarkerDrag(index, ll.lat, ll.lng);
            } catch (e) {
              console.warn('Drag handler error:', e);
            }
          });
          
          routeMarkers.current.push(marker);
        } catch (e) {
          console.warn('Error adding route marker:', e);
        }
      });
      
      // Add all routes; blur/mute alternates, highlight selected
      if (routeGeometries.length > 0) {
        const selectedIdx = Math.min(Math.max(selectedRouteIndex, 0), routeGeometries.length - 1);
      const mainColor = '#4285F4';
      const isPedestrianRoute = selectedTransport === 'foot';
      const dashArray = isPedestrianRoute ? [3, 3] : [2, 1];

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

          // Soft shadow (skip for pedestrian routes)
          if (!isPedestrianRoute) {
            map.current!.addLayer({
              id: shadowLayerId,
              type: 'line',
              source: sourceId,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': '#0f172a',
              'line-width': 6,
              'line-opacity': 0.25,
              'line-blur': 1.5,
              'line-translate': [0, 1]
            }
            });
          }

          // Muted/blurred alternate route
          map.current!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#7BAAF7',
            'line-width': isPedestrianRoute ? 5 : 4,
            'line-opacity': 0.7,
            'line-blur': 0.5,
            'line-dasharray': isPedestrianRoute ? [0.5, 3] : [2, 1]
          }
        });

          map.current!.on('click', layerId, () => onRouteClick(i));
          map.current!.on('mouseenter', layerId, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
          map.current!.on('mouseleave', layerId, () => { map.current!.getCanvas().style.cursor = ''; });

          if (!isPedestrianRoute) {
            routeLayers.current.push({ id: shadowLayerId, source: sourceId });
          }
          routeLayers.current.push({ id: layerId, source: sourceId });
        });

        // Then add the selected route with vivid color and crisp line
        const geometry = routeGeometries[selectedIdx];
        const sourceId = `route-${selectedIdx}`;
        const layerId = `route-${selectedIdx}`;
        const shadowLayerId = `route-shadow-${selectedIdx}`;
        const color = mainColor;

        map.current!.addSource(sourceId, { type: 'geojson', data: geometry });

        if (!isPedestrianRoute) {
          map.current!.addLayer({
            id: shadowLayerId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#FFFFFF',
              'line-width': 10,
              'line-opacity': 1,
              'line-blur': 0.5
            }
          });
        }

        map.current!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': color,
            'line-width': isPedestrianRoute ? 5 : 6,
            'line-opacity': 1,
            'line-blur': 0,
            ...(isPedestrianRoute && { 'line-dasharray': [0.5, 3] })
          }
        });

        map.current!.on('click', layerId, () => onRouteClick(selectedIdx));
        map.current!.on('mouseenter', layerId, () => { map.current!.getCanvas().style.cursor = 'pointer'; });
        map.current!.on('mouseleave', layerId, () => { map.current!.getCanvas().style.cursor = ''; });

        if (!isPedestrianRoute) {
          routeLayers.current.push({ id: shadowLayerId, source: sourceId });
        }
        routeLayers.current.push({ id: layerId, source: sourceId });
      }

      // Add walking paths for destinations far from road (>100m)
      if (walkingPaths && walkingPaths.length > 0) {
        walkingPaths.forEach((walkingPath, index) => {
          const sourceId = `walking-path-${index}`;
          const layerId = `walking-path-${index}`;

          try {
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: walkingPath.geometry
            });

            map.current!.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': '#FFB81C',
                'line-width': 4,
                'line-opacity': 0.8,
                'line-dasharray': [0.5, 3]
              }
            });

            routeLayers.current.push({ id: layerId, source: sourceId });
          } catch (e) {
            console.warn('Error adding walking path:', e);
          }
        });
      }

      // Fit bounds to show entire route
      try {
        const selected = routeGeometries[selectedRouteIndex];
        if (selected && selected.geometry && Array.isArray(selected.geometry.coordinates) && selected.geometry.coordinates.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          selected.geometry.coordinates.forEach(([lng, lat]: [number, number]) => bounds.extend([lng, lat]));
          map.current.fitBounds(bounds, {
            padding: isDirectionsOpen ? { top: 80, right: 80, bottom: 80, left: 500 } : 100,
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
  }, [routePoints, routeGeometries, selectedRouteIndex, onRouteClick, isDirectionsOpen, selectedTransport, walkingPaths]);

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
  const { user, loading: userLoading } = useLoggedInUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState<number | null>(null);
  const [startHighlightIndex, setStartHighlightIndex] = useState<number | null>(null);
  const [endHighlightIndex, setEndHighlightIndex] = useState<number | null>(null);
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
  const [isSelectingStartFromMap, setIsSelectingStartFromMap] = useState(false);
  const [isSelectingEndFromMap, setIsSelectingEndFromMap] = useState(false);
  // Ref to hold latest handler so map click listener isn't stale
  const onMapClickRef = useRef<(lng: number, lat: number) => void | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeGeometries, setRouteGeometries] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [directionSteps, setDirectionSteps] = useState<DirectionStep[]>([]);
  const [isRouteStepsVisible, setIsRouteStepsVisible] = useState(false);
  const [isDirectionsInstructionMode, setIsDirectionsInstructionMode] = useState(false);
  const [walkingPaths, setWalkingPaths] = useState<any[]>([]);
  const [directionsSnapshot, setDirectionsSnapshot] = useState<{
    fromLocation: string;
    toLocation: string;
    selectedStartPoint: SearchResult | null;
    selectedEndPoint: SearchResult | null;
    waypoints: SearchResult[];
    useCurrentLocation: boolean;
  } | null>(null);

  // Remember the last directions mode so we can restore navigation mode when reopening
  const [lastDirectionsMode, setLastDirectionsMode] = useState<'default' | 'navigate' | null>(null);

  // Restore snapshot when theme changes if we have a saved directions snapshot
  useEffect(() => {
    if (!directionsSnapshot) return;
    // Restore saved values to ensure inputs remain populated when theme toggles
    setFromLocation(directionsSnapshot.fromLocation);
    setToLocation(directionsSnapshot.toLocation);
    setSelectedStartPoint(directionsSnapshot.selectedStartPoint);
    setSelectedEndPoint(directionsSnapshot.selectedEndPoint);
    setWaypoints(directionsSnapshot.waypoints);
    setUseCurrentLocation(directionsSnapshot.useCurrentLocation);
  }, [isDark, directionsSnapshot]);
  const [activeInstructionIndex, setActiveInstructionIndex] = useState<number | null>(null);
  const [activeInstructionLocation, setActiveInstructionLocation] = useState<[number, number] | null>(null);
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
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [is3DView, setIs3DView] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [waypoints, setWaypoints] = useState<SearchResult[]>([]);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [waypointSearchQuery, setWaypointSearchQuery] = useState("");
  const [waypointSearchResults, setWaypointSearchResults] = useState<SearchResult[]>([]);
  const [isWaypointSearching, setIsWaypointSearching] = useState(false);
  const [isStartInputFocused, setIsStartInputFocused] = useState(false);
  const [isEndInputFocused, setIsEndInputFocused] = useState(false);

  // Grid overlay state - automatically enabled when grid layer is selected
  const [isGridVisible, setIsGridVisible] = useState(false);

  // Update grid visibility when layer changes
  useEffect(() => {
    if (mapLayer === "grid") {
      setIsGridVisible(true);
    } else {
      setIsGridVisible(false);
    }
  }, [mapLayer]);

  // Per-waypoint UI/search state
  const [waypointInputFocus, setWaypointInputFocus] = useState<Record<number, boolean>>({});
  const [waypointResultsMap, setWaypointResultsMap] = useState<Record<number, SearchResult[]>>({});
  const [waypointSearchingMap, setWaypointSearchingMap] = useState<Record<number, boolean>>({});
  const waypointSkipSearchMapRef = useRef<Record<number, boolean>>({});
  const waypointSearchTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const waypointSectionRefs = useRef<Map<number, HTMLDivElement | null>>(new (globalThis as any).Map());
  const startSectionRef = useRef<HTMLDivElement | null>(null);
  const endSectionRef = useRef<HTMLDivElement | null>(null);

  // Consolidated search results across start/end/waypoints
  const consolidatedResults = React.useMemo(() => {
    const list: { result: SearchResult; type: 'start' | 'end' | 'waypoint'; waypointIndex?: number }[] = [];
    (startPointResults || []).forEach(r => list.push({ result: r, type: 'start' }));
    (endPointResults || []).forEach(r => list.push({ result: r, type: 'end' }));
    Object.entries(waypointResultsMap || {}).forEach(([k, arr]) => {
      (arr || []).forEach(r => list.push({ result: r, type: 'waypoint', waypointIndex: Number(k) }));
    });
    return list;
  }, [startPointResults, endPointResults, waypointResultsMap]);

  const [resultsLocked, setResultsLocked] = useState(false);
  const consolidatedActive = consolidatedResults.length > 0 && !resultsLocked;

  const handleConsolidatedSelect = useCallback((item: { result: SearchResult; type: 'start' | 'end' | 'waypoint'; waypointIndex?: number }) => {
    const { result, type, waypointIndex } = item;
    if (type === 'start') {
      // Directly set start point instead of calling handler (avoids initialization order issues)
      setSelectedStartPoint(result);
      setFromLocation(result.display_name);
      setUseCurrentLocation(false);
      setStartPointResults([]);
    } else if (type === 'end') {
      setSelectedEndPoint(result);
      setToLocation(result.display_name);
      setEndPointResults([]);
    } else if (type === 'waypoint' && waypointIndex != null) {
      setWaypoints(prev => {
        const next = [...prev];
        if (waypointIndex >= 0 && waypointIndex < next.length) {
          next[waypointIndex] = {
            ...next[waypointIndex],
            place_id: result.place_id,
            display_name: result.display_name,
            lat: result.lat,
            lon: result.lon,
            type: result.type || result.category
          } as SearchResult;
        } else {
          // If index doesn't exist, append
          next.push({
            place_id: result.place_id,
            display_name: result.display_name,
            lat: result.lat,
            lon: result.lon,
            type: result.type || result.category
          } as SearchResult);
        }
        return next;
      });
      // Clear waypoint results for this index
      setWaypointResultsMap(prev => {
        const copy = { ...prev };
        delete copy[waypointIndex];
        return copy;
      });
    }
    // Clear all individual result lists so consolidated panel disappears
    setStartPointResults([]);
    setEndPointResults([]);
    setWaypointResultsMap({});
    setWaypointSearchResults([]);
    // Lock results so panel does not reopen until user types a new query
    setResultsLocked(true);
  }, []);

  const hasStartPoint = useCurrentLocation || !!selectedStartPoint || fromLocation.trim().length > 0;
  const hasEndPoint = !!selectedEndPoint || toLocation.trim().length > 0;
  const canShowAddDestinationButton = hasStartPoint && hasEndPoint;

  // Drag-and-drop state for reordering start/waypoints/end
  const routeDragIndexRef = useRef<number | null>(null);
  const [draggingRouteIndex, setDraggingRouteIndex] = useState<number | null>(null);

  const buildRouteOrder = useCallback((): SearchResult[] => {
    const list: SearchResult[] = [];
    if (!useCurrentLocation && selectedStartPoint) list.push(selectedStartPoint);
    list.push(...waypoints);
    if (selectedEndPoint) list.push(selectedEndPoint);
    return list;
  }, [useCurrentLocation, selectedStartPoint, waypoints, selectedEndPoint]);

  const applyRouteOrder = useCallback(async (order: SearchResult[]) => {
    if (order.length < 1) return;
    setUseCurrentLocation(false);
    if (order.length >= 1) {
      setSelectedStartPoint(order[0]);
      setFromLocation(order[0].display_name);
    }
    if (order.length >= 2) {
      const mids = order.slice(1, Math.max(1, order.length - 1));
      setWaypoints(mids);
    } else {
      setWaypoints([]);
    }
    if (order.length >= 2) {
      const end = order[order.length - 1];
      setSelectedEndPoint(end);
      setToLocation(end.display_name);
    }
    const points: RoutePoint[] = order.map(r => ({
      coordinates: [parseFloat(r.lat), parseFloat(r.lon)] as [number, number],
      address: r.display_name
    }));
    if (points.length >= 2) {
      setRoutePoints(points);
      await calculateRouteRef.current?.(points);
    }
  }, [setRoutePoints]);

  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleRouteItemDragStart = useCallback((orderIndex: number, e: React.DragEvent) => {
    routeDragIndexRef.current = orderIndex;
    setDraggingRouteIndex(orderIndex);
    try {
      e.dataTransfer.setData('text/plain', String(orderIndex));
      e.dataTransfer.effectAllowed = 'move';
    } catch {}
  }, []);

  const handleRouteItemDragEnter = useCallback((orderIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetIndex(orderIndex);
  }, []);

  const handleRouteItemDragLeave = useCallback((_orderIndex: number, _e: React.DragEvent) => {
    setDropTargetIndex(prev => (prev === _orderIndex ? null : prev));
  }, []);

  const handleRouteItemDragOver = useCallback((_orderIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(_orderIndex);
  }, []);

  const handleRouteItemDrop = useCallback(async (orderIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    const from = routeDragIndexRef.current ?? Number(e.dataTransfer.getData('text/plain'));
    const to = orderIndex;
    const list = buildRouteOrder();
    if (list.length < 2) {
      setDropTargetIndex(null);
      return;
    }
    if (from != null && !Number.isNaN(from) && to != null && from !== to) {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      await applyRouteOrder(next);
    }
    routeDragIndexRef.current = null;
    setDraggingRouteIndex(null);
    setDropTargetIndex(null);
  }, [buildRouteOrder, applyRouteOrder]);

  const handleRouteItemDragEnd = useCallback(() => {
    routeDragIndexRef.current = null;
    setDraggingRouteIndex(null);
    setDropTargetIndex(null);
  }, []);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState<boolean | null>(null);
const [isRouting, setIsRouting] = useState(false);
const [routeError, setRouteError] = useState<string | null>(null);

useEffect(() => {
  if (locationError) {
    toast.error('Location error', locationError);
    setLocationError(null);
  }
}, [locationError, toast]);
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
  const calculateRouteRef = useRef<((points: RoutePoint[], modeId?: string) => Promise<void>) | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);

  // Fixed transport modes with Valhalla costings (no bus option)
  const transportModes = [
    { id: "car", icon: Car, label: "Car", profile: "auto", color: "#036A38" },
    { id: "bike", icon: Bike, label: "Bicycle", profile: "bicycle", color: "#036A38" },
    { id: "foot", icon: Footprints, label: "Walk", profile: "pedestrian", color: "#FFB81C" },
    { id: "motorcycle", icon: Motorbike, label: "Motorcycle", profile: "motorcycle", color: "#036A38" },
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
  // New detailed routing API integration
  const calculateRoute = useCallback(async (points: RoutePoint[], modeId?: string) => {
    if (points.length < 2) return;

    setIsRouting(true);
    setRouteError(null);
    setAvailableRoutes([]);
    setRouteGeometries([]);
    
    try {
      const selectedMode = transportModes.find(mode => mode.id === (modeId ?? selectedTransport));
      const transportMode = modeId ?? selectedTransport;
      
      // Use the new routing API
      const { calculateRoute: newCalculateRoute } = await import('@/lib/routingApi');
      const routes = await newCalculateRoute(points, transportMode);
      
      if (routes.length === 0) {
        throw new Error('No routes found');
      }

      // Process routes for the existing UI
      const processedRoutes = routes.map(route => ({
        distance: route.distance,
        time: route.time,
        instructions: route.instructions,
        geometry: route.geometry
      }));

      // Sort by time ascending
      processedRoutes.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
      
      setAvailableRoutes(processedRoutes);
      setSelectedRouteIndex(0);

      const selectedRoute = processedRoutes[0];
      const steps = selectedRoute.instructions || [];
      
      setRouteInfo({
        distance: (selectedRoute.distance / 1000).toFixed(1),
        time: Math.round(selectedRoute.time / 60000),
        instructions: steps,
        totalRoutes: processedRoutes.length
      });

      setDirectionSteps(steps);
      setIsRouteStepsVisible(false);
      setActiveInstructionIndex(null);
      setActiveInstructionLocation(null);
      setCurrentStepIndex(0);
      
      // Voice navigation for first instruction
      if (isVoiceNavigationEnabled && steps.length > 0) {
        speakInstruction(steps[0].instruction);
      }

      setRouteGeometries(processedRoutes.map(r => r.geometry));
      
      // Check for walking paths (destinations far from road)
      const destinationCoords = points[points.length - 1]?.coordinates;
      const walkingPathsData: any[] = [];
      
      if (destinationCoords && selectedRoute.geometry.geometry.coordinates.length > 0) {
        const routeCoords = selectedRoute.geometry.geometry.coordinates;
        const lastRouteCoord = routeCoords[routeCoords.length - 1];
        const destLat = destinationCoords[0];
        const destLng = destinationCoords[1];
        const lastLat = lastRouteCoord[1];
        const lastLng = lastRouteCoord[0];

        const distance = calculateDistance(lastLat, lastLng, destLat, destLng);
        if (distance > 100) {
          walkingPathsData.push({
            routeIndex: 0,
            geometry: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [[lastLng, lastLat], [destLng, destLat]]
              }
            },
            distance: distance
          });
        }
      }
      
      setWalkingPaths(walkingPathsData);

      // Update mode summaries
      const summaryMap: Record<string, { timeMs: number; distanceM: number }> = {};
      summaryMap[transportMode] = {
        timeMs: selectedRoute.time,
        distanceM: selectedRoute.distance
      };
      setModeSummaries(summaryMap);
      
    } catch (error) {
      console.error('New routing API failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Route calculation failed';
      
      setRouteError(errorMessage);
      setRouteGeometries([]);
      setAvailableRoutes([]);
      setRouteInfo(null);
      setDirectionSteps([]);
      setIsRouteStepsVisible(false);
      setActiveInstructionIndex(null);
      setWalkingPaths([]);
      setActiveInstructionLocation(null);
      setCurrentStepIndex(0);
      
      toast.error('Route calculation failed', errorMessage);
    } finally {
      setIsRouting(false);
    }
  }, [selectedTransport, transportModes, selectedRouteIndex, isVoiceNavigationEnabled, speakInstruction]);
  useEffect(() => { calculateRouteRef.current = calculateRoute; }, [calculateRoute]);
  // Handle transport mode change - recalculate route
  const handleTransportModeChange = useCallback((newMode: string) => {
    setSelectedTransport(newMode);
    setSelectedRouteIndex(0);
    setRouteError(null);
    setIsRouting(true);
    setAvailableRoutes([]);
    setRouteGeometries([]);
    if (routePoints.length >= 2) {
      calculateRouteRef.current?.(routePoints, newMode);
    } else {
      setIsRouting(false);
    }
  }, [routePoints]);

const mapLayers = [
    {
      id: "vector",
      name: "OSM Bright",
      icon: MapIcon,
      description: "Road map",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <rect width="120" height="100" fill="#f4f3f0"/>
          {/* Streets */}
          <path d="M0 30 L120 30" stroke="#ffffff" strokeWidth="4"/>
          <path d="M0 50 L120 50" stroke="#ffffff" strokeWidth="3"/>
          <path d="M0 70 L120 70" stroke="#ffffff" strokeWidth="2"/>
          <path d="M40 0 L40 100" stroke="#ffffff" strokeWidth="3"/>
          <path d="M80 0 L80 100" stroke="#ffffff" strokeWidth="2"/>
          {/* Buildings */}
          <rect x="10" y="10" width="20" height="15" fill="#e8e4db"/>
          <rect x="50" y="35" width="15" height="10" fill="#e8e4db"/>
          <rect x="85" y="55" width="25" height="20" fill="#e8e4db"/>
          <rect x="15" y="75" width="18" height="18" fill="#e8e4db"/>
          {/* Park */}
          <circle cx="95" cy="20" r="12" fill="#c8e6c9"/>
        </svg>
      )
    },
    {
      id: "grid",
      name: "Grid View",
      icon: Grid3X3,
      description: "OSM with Grid",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <rect width="120" height="100" fill="#f4f3f0"/>
          {/* Streets */}
          <path d="M0 30 L120 30" stroke="#ffffff" strokeWidth="4"/>
          <path d="M0 50 L120 50" stroke="#ffffff" strokeWidth="3"/>
          <path d="M0 70 L120 70" stroke="#ffffff" strokeWidth="2"/>
          <path d="M40 0 L40 100" stroke="#ffffff" strokeWidth="3"/>
          <path d="M80 0 L80 100" stroke="#ffffff" strokeWidth="2"/>
          {/* Grid overlay - pure green with low opacity */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00FF00" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="120" height="100" fill="url(#grid)"/>
          {/* Buildings */}
          <rect x="10" y="10" width="20" height="15" fill="#e8e4db"/>
          <rect x="50" y="35" width="15" height="10" fill="#e8e4db"/>
          <rect x="85" y="55" width="25" height="20" fill="#e8e4db"/>
          <rect x="15" y="75" width="18" height="18" fill="#e8e4db"/>
          {/* Park */}
          <circle cx="95" cy="20" r="12" fill="#c8e6c9"/>
        </svg>
      )
    },
    {
      id: "klokantech",
      name: "Basic",
      icon: Layers,
      description: "Basic style",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <rect width="120" height="100" fill="#ffffff"/>
          {/* Streets - minimal */}
          <path d="M0 30 L120 30" stroke="#cccccc" strokeWidth="2"/>
          <path d="M0 50 L120 50" stroke="#cccccc" strokeWidth="1.5"/>
          <path d="M0 70 L120 70" stroke="#cccccc" strokeWidth="1"/>
          <path d="M40 0 L40 100" stroke="#cccccc" strokeWidth="1.5"/>
          <path d="M80 0 L80 100" stroke="#cccccc" strokeWidth="1"/>
          {/* Buildings - outline only */}
          <rect x="10" y="10" width="20" height="15" fill="none" stroke="#999999" strokeWidth="1"/>
          <rect x="50" y="35" width="15" height="10" fill="none" stroke="#999999" strokeWidth="1"/>
          <rect x="85" y="55" width="25" height="20" fill="none" stroke="#999999" strokeWidth="1"/>
          <rect x="15" y="75" width="18" height="18" fill="none" stroke="#999999" strokeWidth="1"/>
          {/* Labels simulation */}
          <text x="20" y="95" fontSize="6" fill="#666666">Street</text>
        </svg>
      )
    },
    {
      id: "dark",
      name: "Dark",
      icon: Moon,
      description: "Dark style",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <rect width="120" height="100" fill="#1a1a1a"/>
          {/* Streets - light on dark */}
          <path d="M0 30 L120 30" stroke="#3a3a3a" strokeWidth="4"/>
          <path d="M0 50 L120 50" stroke="#3a3a3a" strokeWidth="3"/>
          <path d="M0 70 L120 70" stroke="#3a3a3a" strokeWidth="2"/>
          <path d="M40 0 L40 100" stroke="#3a3a3a" strokeWidth="3"/>
          <path d="M80 0 L80 100" stroke="#3a3a3a" strokeWidth="2"/>
          {/* Buildings */}
          <rect x="10" y="10" width="20" height="15" fill="#2d2d2d"/>
          <rect x="50" y="35" width="15" height="10" fill="#2d2d2d"/>
          <rect x="85" y="55" width="25" height="20" fill="#2d2d2d"/>
          <rect x="15" y="75" width="18" height="18" fill="#2d2d2d"/>
          {/* Park - darker green */}
          <circle cx="95" cy="20" r="12" fill="#1a3a1a"/>
          {/* Highlight lines */}
          <path d="M0 30 L120 30" stroke="#4a90e2" strokeWidth="0.5" opacity="0.5"/>
        </svg>
      )
    },
    {
      id: "elevated",
      name: "Elevated",
      icon: Mountain,
      description: "Elevated style",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <defs>
            <linearGradient id="terrain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8f5e9"/>
              <stop offset="40%" stopColor="#dcedc8"/>
              <stop offset="70%" stopColor="#c5e1a5"/>
              <stop offset="100%" stopColor="#aed581"/>
            </linearGradient>
          </defs>
          <rect width="120" height="100" fill="url(#terrain)"/>
          {/* Contour lines */}
          <path d="M0 20 Q30 18 60 20 T120 20" stroke="#81c784" strokeWidth="1" fill="none" opacity="0.6"/>
          <path d="M0 40 Q30 38 60 40 T120 40" stroke="#66bb6a" strokeWidth="1" fill="none" opacity="0.6"/>
          <path d="M0 60 Q30 58 60 60 T120 60" stroke="#4caf50" strokeWidth="1" fill="none" opacity="0.6"/>
          <path d="M0 80 Q30 78 60 80 T120 80" stroke="#43a047" strokeWidth="1" fill="none" opacity="0.6"/>
          {/* Hillshading effect */}
          <ellipse cx="60" cy="45" rx="35" ry="25" fill="#ffffff" opacity="0.15"/>
          <ellipse cx="90" cy="70" rx="25" ry="18" fill="#000000" opacity="0.08"/>
          {/* Streets with shadow */}
          <path d="M0 50 L120 50" stroke="#8d6e63" strokeWidth="2" opacity="0.5"/>
          <path d="M60 0 L60 100" stroke="#8d6e63" strokeWidth="2" opacity="0.5"/>
        </svg>
      )
    },
    {
      id: "satellite",
      name: "Satellite",
      icon: Satellite,
      description: "ESRI Satellite",
      preview: (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <defs>
            <pattern id="terrain-texture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#3a5f3a"/>
              <circle cx="3" cy="3" r="1" fill="#2d4a2d"/>
              <circle cx="7" cy="7" r="1" fill="#2d4a2d"/>
            </pattern>
          </defs>
          <rect width="120" height="100" fill="#4a6b4a"/>
          {/* Terrain variation */}
          <rect width="120" height="100" fill="url(#terrain-texture)" opacity="0.5"/>
          {/* Forest areas */}
          <ellipse cx="30" cy="25" rx="20" ry="15" fill="#2d4a2d"/>
          <ellipse cx="90" cy="60" rx="25" ry="20" fill="#2d4a2d"/>
          {/* Urban area */}
          <rect x="45" y="35" width="30" height="30" fill="#5a5a5a" opacity="0.7"/>
          <rect x="48" y="38" width="4" height="4" fill="#6a6a6a"/>
          <rect x="54" y="38" width="4" height="4" fill="#6a6a6a"/>
          <rect x="60" y="38" width="4" height="4" fill="#6a6a6a"/>
          <rect x="48" y="44" width="4" height="4" fill="#6a6a6a"/>
          <rect x="60" y="44" width="4" height="4" fill="#6a6a6a"/>
          <rect x="48" y="56" width="4" height="4" fill="#6a6a6a"/>
          <rect x="66" y="56" width="4" height="4" fill="#6a6a6a"/>
          {/* Road */}
          <path d="M0 50 L120 50" stroke="#7a7a7a" strokeWidth="3"/>
          <path d="M60 0 L60 100" stroke="#7a7a7a" strokeWidth="2"/>
          {/* Water body */}
          <ellipse cx="15" cy="75" rx="12" ry="10" fill="#1a4a6a"/>
        </svg>
      )
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
      const results = await searchPlaces(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
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
      const results = await searchPlaces(query, 8);
      setStartPointResults(results);
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
      const results = await searchPlaces(query, 8);
      setEndPointResults(results);
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
      const results = await searchPlaces(query, 8);
      setWaypointSearchResults(results);
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
  calculateRouteRef.current?.(newRoutePoints);
}
  }, [routePoints]);
  
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
    // Ensure we don't automatically open the add-destination input after selecting endpoint
    setIsAddingWaypoint(false);
    setWaypointSearchResults([]);
  }, [setWaypointSearchResults]);
  
  // Add destination to route
  const addWaypoint = useCallback((point: SearchResult) => {
    skipWaypointSearchRef.current = true;
    skipEndSearchRef.current = true;

    setWaypoints(prev => {
      if (!selectedEndPoint) {
        return prev;
      }

      const exists = prev.some(w => w.place_id === selectedEndPoint.place_id);
      if (exists) {
        return prev;
      }

      return [...prev, selectedEndPoint];
    });

    setSelectedEndPoint(point);
    setToLocation(point.display_name);
    setWaypointSearchQuery("");
    setWaypointSearchResults([]);
    setIsAddingWaypoint(false);
  }, [selectedEndPoint]);
  
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
  
  // Per-waypoint search (debounced) and selection handlers
  const performWaypointIndexedSearch = useCallback(async (index: number, query: string) => {
    if (!query.trim()) {
      setWaypointResultsMap(prev => ({ ...prev, [index]: [] }));
      setWaypointSearchingMap(prev => ({ ...prev, [index]: false }));
      return;
    }
    setWaypointSearchingMap(prev => ({ ...prev, [index]: true }));
    try {
      const results = await searchPlaces(query, 8);
      setWaypointResultsMap(prev => ({ ...prev, [index]: results }));
    } catch (e) {
      console.warn('Waypoint search failed:', e);
      setWaypointResultsMap(prev => ({ ...prev, [index]: [] }));
    } finally {
      setWaypointSearchingMap(prev => ({ ...prev, [index]: false }));
    }
  }, []);

  const handleWaypointInputChange = useCallback((index: number, val: string) => {
    // Unlock results because user typed
    setResultsLocked(false);
    // Clear other result lists so only fresh results show
    setStartPointResults([]);
    setEndPointResults([]);
    setWaypointResultsMap({});
    // Update display text immediately
    setWaypoints(prev => prev.map((w, i) => (i === index ? { ...w, display_name: val } : w)));
    // Skip next search if just selected a suggestion
    if (waypointSkipSearchMapRef.current[index]) {
      waypointSkipSearchMapRef.current[index] = false;
      return;
    }
    // Debounce per index
    const timeouts = waypointSearchTimeoutsRef.current;
    if (timeouts[index]) clearTimeout(timeouts[index]);
    timeouts[index] = setTimeout(() => {
      performWaypointIndexedSearch(index, val);
    }, 300) as unknown as NodeJS.Timeout;
  }, [performWaypointIndexedSearch]);

  const handleWaypointResultSelect = useCallback((index: number, result: SearchResult) => {
    waypointSkipSearchMapRef.current[index] = true;
    setWaypoints(prev => prev.map((w, i) => (
      i === index
        ? { ...w, place_id: result.place_id, display_name: result.display_name, lat: result.lat, lon: result.lon, type: result.type || result.category }
        : w
    )));
    setWaypointResultsMap(prev => ({ ...prev, [index]: [] }));
    setWaypointInputFocus(prev => ({ ...prev, [index]: false }));
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
        setHasGeolocationPermission(true);
      },
      (error) => {
        // If permission explicitly denied, update permission state
        if (error && typeof error.code === 'number' && error.code === 1) {
          setHasGeolocationPermission(false);
        }
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

  // Probe Permissions API if available to know initial permission state
  useEffect(() => {
    if (!('permissions' in navigator)) return;
    try {
      // @ts-ignore navigator.permissions type may not include geolocation in some TS versions
      navigator.permissions.query({ name: 'geolocation' }).then((status: any) => {
        setHasGeolocationPermission(status.state === 'granted');
        status.onchange = () => setHasGeolocationPermission(status.state === 'granted');
      }).catch(() => {});
    } catch (e) {}
  }, []);
  
  // Handle map click with reverse geocoding
  const handleMapClick = useCallback(async (lng: number, lat: number) => {
    try {
      const data = await reverseGeocode(lat, lng);
      if (data.display) {
        // If user simply clicks map (not picking start/end/waypoint) show compact details overlay like Google Maps
        if (!isSelectingStartFromMap && !isSelectingEndFromMap && !isSelectingWaypointFromMap) {
          setMarkerDetails({
            coordinates: [lat, lng],
            address: data.display,
            name: data.display.split(',')[0],
            type: data.type
          });
          // hide search UI when pinning
          try { setSearchResults([]); setSearchQuery(""); } catch {}
          return;
        }
        // If user is selecting a start from the map
        if (isSelectingStartFromMap) {
          const startPoint: SearchResult = {
            place_id: `map-start-${Date.now()}`,
            display_name: data.display,
            lat: lat.toString(),
            lon: lng.toString(),
            type: data.type
          } as SearchResult;

          // Prevent debounced start search from firing when location is set programmatically from map
          skipStartSearchRef.current = true;
          setSelectedStartPoint(startPoint);
          setFromLocation(data.display);
          setUseCurrentLocation(false);
          setIsSelectingStartFromMap(false);
          setMarkerDetails({ coordinates: [lat, lng], address: data.display, name: data.display.split(',')[0], type: data.type });
          toast?.success?.('Start selected', data.display.split(',')[0]);
          return;
        }

        // If user is selecting an end/destination from the map
        if (isSelectingEndFromMap) {
          const endPoint: SearchResult = {
            place_id: `map-end-${Date.now()}`,
            display_name: data.display,
            lat: lat.toString(),
            lon: lng.toString(),
            type: data.type
          } as SearchResult;

          // Prevent debounced end search from firing when location is set programmatically from map
          skipEndSearchRef.current = true;
          setSelectedEndPoint(endPoint);
          setToLocation(data.display);
          setIsSelectingEndFromMap(false);
          setMarkerDetails({ coordinates: [lat, lng], address: data.display, name: data.display.split(',')[0], type: data.type });
          toast?.success?.('Destination selected', data.display.split(',')[0]);

          // If we have a start (either current or selected), auto-add route points and calculate
          const startCoord = useCurrentLocation && userLocation ? userLocation : selectedStartPoint ? [parseFloat(selectedStartPoint.lat), parseFloat(selectedStartPoint.lon)] : null;
          if (startCoord) {
            const pts: RoutePoint[] = [
              { coordinates: startCoord, address: startCoord === userLocation ? 'Current Location' : (selectedStartPoint?.display_name || 'Start') },
              { coordinates: [lat, lng], address: data.display }
            ];
            setRoutePoints(pts);
            calculateRouteRef.current?.(pts);
          }

          return;
        }

        // If user is selecting a waypoint from the map, add it as a waypoint
        if (isSelectingWaypointFromMap) {
          setMarkerDetails({
            coordinates: [lat, lng],
            address: data.display,
            name: data.display.split(',')[0],
            type: data.type
          });

          const result: SearchResult = {
            place_id: `map-waypoint-${Date.now()}`,
            display_name: data.display,
            lat: lat.toString(),
            lon: lng.toString(),
            type: data.type
          } as any;

          // Add destination and clear selection mode; do not open input automatically
          addWaypoint(result);
          setIsSelectingWaypointFromMap(false);
          // Ensure add-input is closed and Add destination button is visible
          setIsAddingWaypoint(false);
          toast?.success?.('Destination added', data.display.split(',')[0]);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  }, [isSelectingWaypointFromMap, isSelectingStartFromMap, isSelectingEndFromMap, addWaypoint, toast, useCurrentLocation, userLocation, selectedStartPoint]);

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
      calculateRouteRef.current?.(newRoutePoints);

      // Auto-fill direction form with the first and last points
      setUseCurrentLocation(false);
      // Prevent debounced searches when filling from/to programmatically
      skipStartSearchRef.current = true;
      skipEndSearchRef.current = true;
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
  }, [routePoints]);
  
  // Handle directions - now just opens the panel
  const handleDirections = useCallback(() => {
    setIsMenuOpen(false);
    setShowLayerPanel(false);
    clearMapOverlays();
    setIsDirectionsOpen(true);
    setSearchResults([]);
    setSearchQuery("");
    // If we have a marker selected, use it as the end point
    if (markerDetails) {
      // Prevent debounced searches when filling inputs from the selected marker
      skipEndSearchRef.current = true;
      skipStartSearchRef.current = true;
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
          calculateRouteRef.current?.(newRoutePoints);
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
        calculateRouteRef.current?.(newRoutePoints);
      }
    }
  }, [markerDetails, routePoints, userLocation]);
  
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
    
    // Add middle destinations
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
      setIsRouteStepsVisible(false);
      setActiveInstructionIndex(null);
      setActiveInstructionLocation(null);
      setCurrentStepIndex(0);
      setRoutePoints(points);
      calculateRouteRef.current?.(points);
    }
  }, [useCurrentLocation, userLocation, selectedStartPoint, waypoints, selectedEndPoint]);
  
  // Handle route selection
  const selectRoute = useCallback((index: number) => {
    if (availableRoutes.length === 0) return;

    const newIndex = Math.min(index, availableRoutes.length - 1);
    setSelectedRouteIndex(newIndex);
    const selectedRoute = availableRoutes[newIndex];

    const steps = (selectedRoute.instructions || []) as DirectionStep[];

    setRouteInfo({
      distance: (selectedRoute.distance / 1000).toFixed(1),
      time: Math.round(selectedRoute.time / 60000),
      instructions: steps,
      totalRoutes: availableRoutes.length
    });

    setDirectionSteps(steps);
    setIsRouteStepsVisible(false);
    setActiveInstructionIndex(null);
    setActiveInstructionLocation(null);
    setCurrentStepIndex(0);

    if (isVoiceNavigationEnabled && steps.length > 0) {
      speakInstruction(steps[0].instruction);
    }
  }, [availableRoutes, isVoiceNavigationEnabled, speakInstruction]);

  // Reverse geocode helper for drag updates - now uses the new Map API
  const reverseGeocodeCallback = useCallback(async (lat: number, lng: number) => {
    return await reverseGeocode(lat, lng);
  }, []);

  // Handle route marker drag from map
  const handleRouteMarkerDrag = useCallback(async (index: number, lat: number, lng: number) => {
    const total = routePoints.length;
    if (total < 2 || index < 0 || index >= total) return;

    const { display, type } = await reverseGeocodeCallback(lat, lng);

    const usingInputs = !!selectedEndPoint || !!selectedStartPoint || waypoints.length > 0 || useCurrentLocation;

    if (usingInputs) {
      // Update inputs so auto routing recalculates correctly
      if (index === 0) {
        if (useCurrentLocation) {
          setUseCurrentLocation(false);
        }
        // Avoid triggering a search when updating inputs due to marker drag
        skipStartSearchRef.current = true;
        setSelectedStartPoint({
          place_id: `drag-start-${Date.now()}`,
          display_name: display,
          lat: String(lat),
          lon: String(lng),
          type
        } as SearchResult);
        setFromLocation(display);
      } else if (index === total - 1) {
        // Avoid triggering a search when updating inputs due to marker drag
        skipEndSearchRef.current = true;
        setSelectedEndPoint({
          place_id: `drag-end-${Date.now()}`,
          display_name: display,
          lat: String(lat),
          lon: String(lng),
          type
        } as SearchResult);
        setToLocation(display);
      } else {
        const wpIndex = index - 1;
        setWaypoints(prev => {
          const next = [...prev];
          if (wpIndex >= 0 && wpIndex < next.length) {
            const prevWp = next[wpIndex];
            next[wpIndex] = {
              ...prevWp,
              place_id: `drag-wp-${wpIndex}-${Date.now()}`,
              display_name: display,
              lat: String(lat),
              lon: String(lng),
              type
            } as SearchResult;
          }
          return next;
        });
      } 
      // Trigger recompute
      calculateRouteFromPoints();
    } else {
      // No inputs in use; update routePoints directly
      const next = [...routePoints];
      next[index] = { coordinates: [lat, lng], address: display } as RoutePoint;
      setRoutePoints(next);
      await calculateRouteRef.current?.(next);
    }
  }, [routePoints, selectedStartPoint, selectedEndPoint, waypoints.length, useCurrentLocation, reverseGeocodeCallback, calculateRouteFromPoints]);

  const focusOnInstruction = useCallback((step: DirectionStep, index: number) => {
    setActiveInstructionIndex(index);
    setCurrentStepIndex(index);
    if (isVoiceNavigationEnabled) {
      speakInstruction(step.instruction);
    }
    if (step.coordinates) {
      setActiveInstructionLocation(step.coordinates);
      setCenterPoint(step.coordinates);
    } else {
      setActiveInstructionLocation(null);
    }
  }, [isVoiceNavigationEnabled, speakInstruction]);

  const handleRouteNavigateClick = useCallback((routeIndex: number, isCurrentlySelected: boolean) => {
    if (!isCurrentlySelected) {
      selectRoute(routeIndex);
    }
    if (routePoints.length >= 2) {
      setIsDirectionsOpen(true);
      setIsRouteStepsVisible(true);
      setIsDirectionsInstructionMode(true);
      setDirectionsSnapshot({
        fromLocation,
        toLocation,
        selectedStartPoint,
        selectedEndPoint,
        waypoints: [...waypoints],
        useCurrentLocation,
      });
      setFromLocation("");
      setToLocation("");
      setSelectedStartPoint(null);
      setSelectedEndPoint(null);
      setWaypoints([]);
      setUseCurrentLocation(false);
      setStartPointResults([]);
      setEndPointResults([]);
    }
  }, [selectRoute, routePoints, fromLocation, toLocation, selectedStartPoint, selectedEndPoint, waypoints, useCurrentLocation]);

  // Toggle voice navigation
  const toggleVoiceNavigation = useCallback(() => {
    setIsVoiceNavigationEnabled(!isVoiceNavigationEnabled);
    if (!isVoiceNavigationEnabled && directionSteps.length > 0) {
      speakInstruction(directionSteps[currentStepIndex]?.instruction || 'Navigation started');
    } else {
      window.speechSynthesis.cancel();
    }
  }, [isVoiceNavigationEnabled, directionSteps, currentStepIndex, speakInstruction]);

  const baseCalculateRouteButtonClasses =
    "h-9 text-sm px-4 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:translate-y-0 transform whitespace-nowrap min-w-[9rem]";

  const renderCalculateRouteButton = (className?: string) => (
    <Button
      onClick={calculateRouteFromPoints}
      disabled={isRouting || ((useCurrentLocation ? false : !selectedStartPoint) || !selectedEndPoint)}
      className={cn(className, baseCalculateRouteButtonClasses)}
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
  );

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
            await calculateRouteRef.current?.(newPoints);
            return;
          }
        }
      }
      await calculateRouteRef.current?.(routePoints);
    } catch (error) {
      console.error('Route optimization failed:', error);
    }
  }, [routePoints, selectedTransport, transportModes]);
  
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
    // Clear saved directions snapshot to avoid restoring stale inputs
    setDirectionsSnapshot(null);
    // Clear remembered last directions mode
    setLastDirectionsMode(null);

    // Stop any active speech
    window.speechSynthesis.cancel();
  }, []);

  // Clear only map overlays/route state (keep the directions panel open and preserve inputs)
  const clearMapOverlays = useCallback(() => {
    setRouteInfo(null);
    setRoutePoints([]);
    setRouteGeometries([]);
    setDirectionSteps([]);
    setAvailableRoutes([]);
    setSelectedRouteIndex(0);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setIsRouteStepsVisible(false);
    setIsDirectionsInstructionMode(false);
    setActiveInstructionIndex(null);
    setActiveInstructionLocation(null);
    setCenterPoint(null);
    // Stop any active speech
    window.speechSynthesis.cancel();
  }, []);
  
  // Handle directions overlay dismissal
  const handleDirectionsDismiss = useCallback(() => {
    // Clear everything when the directions panel is closed
    clearAll();
  }, [clearAll]);
  
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
    // Reset highlight when search results change
    setSearchHighlightIndex(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If we have a saved directions snapshot and the directions panel is open,
    // avoid performing a global search automatically (prevents accidental clearing/restores).
    if (directionsSnapshot && isDirectionsOpen) {
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch, directionsSnapshot, isDirectionsOpen]);
  
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

  // Reset start highlight when results change
  useEffect(() => {
    setStartHighlightIndex(null);
  }, [startPointResults.length]);
  
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

  // Reset end highlight when results change
  useEffect(() => {
    setEndHighlightIndex(null);
  }, [endPointResults.length]);
  
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

  // Close search results on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inInput = !!(searchContainerRef.current && searchContainerRef.current.contains(target));
      const inPanel = !!(searchPanelRef.current && searchPanelRef.current.contains(target));
      if (!inInput && !inPanel && searchResults.length > 0) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [searchResults.length]);

  // Outside click to blur start/end suggestion lists and waypoint lists
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (startSectionRef.current && !startSectionRef.current.contains(target)) {
        setIsStartInputFocused(false);
      }
      if (endSectionRef.current && !endSectionRef.current.contains(target)) {
        setIsEndInputFocused(false);
      }
      // Handle per-waypoint focus states
      const mapRefs = waypointSectionRefs.current;
      let insideIndex: number | null = null;
      mapRefs.forEach((el, idx) => {
        if (el && el.contains(target)) insideIndex = idx;
      });
      if (insideIndex == null) {
        setWaypointInputFocus({});
      } else {
        setWaypointInputFocus(prev => {
          const next: Record<number, boolean> = { ...prev };
          Object.keys(next).forEach((k) => {
            next[Number(k)] = Number(k) === insideIndex;
          });
          return next;
        });
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

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

  // Close search dropdown when directions is opened
  useEffect(() => {
    if (isDirectionsOpen) {
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [isDirectionsOpen]);

  // Close directions when search suggestions open
  useEffect(() => {
    if (searchResults.length > 0) {
      setIsDirectionsOpen(false);
      setIsDirectionsInstructionMode(false);
      setIsRouteStepsVisible(false);
    }
  }, [searchResults.length]);

  return (
    <div className="fixed inset-0 w-screen overflow-hidden bg-background" style={{ height: '100dvh', ['--primary' as any]: '151 94% 21%', ['--primary-foreground' as any]: '0 0% 100%', ['--secondary' as any]: '41 100% 55%', ['--secondary-foreground' as any]: '0 0% 0%', ['--brand' as any]: '151 94% 21%', ['--brand-foreground' as any]: '0 0% 100%', ['--gradient-from' as any]: '151 94% 21%', ['--gradient-via' as any]: '41 100% 55%', ['--gradient-to' as any]: '41 92% 40%'}}>
      {/* Floating Search - top-left (logo left, input center, directions right) */}
      <div className="absolute top-3 left-2 sm:top-4 sm:left-4 z-50 w-[calc(100vw-4.5rem)] sm:w-[min(90vw,28rem)]" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex-shrink-0">
            <div className="rounded-full bg-transparent p-[2px] shadow-lg">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-card/90 flex items-center justify-center overflow-hidden">
                <img src="/logo/logo.png" alt="NINja Map" className="h-full w-full object-contain p-1" />
              </div>
            </div>
          </Link>

          <div className="relative flex-1" ref={searchContainerRef}>
            <div className="rounded-full overflow-hidden border border-border/40 bg-card/90 shadow-lg focus-within:ring-2 focus-within:ring-brand/20 transition-all duration-150">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 z-10" />

                <Input
                  placeholder="Search places"
                  className="h-11 sm:h-12 w-full bg-transparent border-0 rounded-none pl-10 pr-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setResultsLocked(false); }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (searchResults.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSearchHighlightIndex(idx => (idx == null ? 0 : Math.min((idx ?? 0) + 1, searchResults.length - 1)));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSearchHighlightIndex(idx => (idx == null ? searchResults.length - 1 : Math.max((idx ?? 0) - 1, 0)));
                    } else if (e.key === 'Enter') {
                      if (searchHighlightIndex != null && searchResults[searchHighlightIndex]) {
                        handleSearchResultClick(searchResults[searchHighlightIndex]);
                        setSearchResults([]);
                        setSearchQuery('');
                      }
                    } else if (e.key === 'Escape') {
                      setSearchResults([]);
                      setSearchQuery('');
                    }
                  }}
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

          </div>

          {/* Directions button as sibling to input */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Clear map overlays so directions panel opens fresh
                clearMapOverlays();
                setMarkerDetails(null);
                setDestination(null);
                setSearchResults([]);
                setSearchQuery("");
                // Always open the Directions panel to the initial form (clear any navigation mode)
                // Clear inputs so user starts a fresh directions session
                setFromLocation("");
                setToLocation("");
                setSelectedStartPoint(null);
                setSelectedEndPoint(null);
                setWaypoints([]);
                setUseCurrentLocation(false);
                setIsDirectionsInstructionMode(false);
                setIsRouteStepsVisible(false);
                setIsNavigating(false);

                setIsDirectionsOpen(true);
                setShowLayerPanel(false);
              }}
              className="h-9 w-9 sm:h-10 sm:w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center transition"
              title="Directions"
            >
              <Route className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Theme Toggle - top-right */}
      <div className="absolute top-3 right-2 sm:top-4 sm:right-4 z-50" style={{ marginTop: 'env(safe-area-inset-top)' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="h-8 w-8 sm:h-9 sm:w-9 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm flex items-center justify-center transition"
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
        {markerDetails && (!isDirectionsOpen || routePoints.length < 2) && (
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
      
      
      {/* Search Results Overlay */}
      <AnimatePresence>
        {searchResults.length > 0 && !resultsLocked && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.09, ease: 'easeOut' }}
            className="absolute top-24 left-2 right-2 sm:top-20 sm:left-[4.25rem] sm:right-auto z-50 w-[min(95vw,22rem)] sm:w-[min(90vw,22rem)]"
          >
            <div ref={searchPanelRef} className="rounded-3xl overflow-hidden border border-border/40 bg-card/90 shadow-lg p-3 sm:p-4 w-[min(95vw,22rem)] sm:w-[min(90vw,22rem)] overflow-y-auto ring-1 ring-border/30" style={{ maxHeight: 'calc(100dvh - 5rem)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Search results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchResults([]); setSearchQuery(""); }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-0">
                {searchResults.map((result, index) => {
                  const IconComponent = getPlaceIcon(result.type || result.category || '');
                  const isActive = searchHighlightIndex === index;
                  return (
                    <motion.button
                      key={result.place_id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.06, delay: index * 0.015 }}
                      onMouseEnter={() => setSearchHighlightIndex(index)}
                      onMouseLeave={() => setSearchHighlightIndex(null)}
                      onClick={() => { handleSearchResultClick(result); setSearchResults([]); setSearchQuery(""); }}
                      className={`w-full text-left p-3 border-b border-border/20 transition-colors flex items-start gap-3 ${isActive ? 'bg-accent/20' : 'hover:bg-accent/10'}`}
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
            className="absolute top-24 left-2 right-2 sm:top-20 sm:left-4 sm:right-auto z-50 w-auto sm:w-[min(90vw,28rem)] overflow-x-hidden"
          >
            <div className="rounded-3xl overflow-hidden border border-border/40 bg-card/90 shadow-lg p-3 sm:p-4 w-full sm:w-[min(95vw,25rem)] ring-1 ring-border/30 flex flex-col" style={{ maxHeight: 'calc(100dvh - 9rem)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isDirectionsInstructionMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (directionsSnapshot) {
                          setFromLocation(directionsSnapshot.fromLocation);
                          setToLocation(directionsSnapshot.toLocation);
                          setSelectedStartPoint(directionsSnapshot.selectedStartPoint);
                          setSelectedEndPoint(directionsSnapshot.selectedEndPoint);
                          setWaypoints(directionsSnapshot.waypoints);
                          setUseCurrentLocation(directionsSnapshot.useCurrentLocation);
                        }
                        setIsDirectionsInstructionMode(false);
                        setIsRouteStepsVisible(false);
                        setIsNavigating(false);
                      }}
                      className="h-6 px-2"
                      title="Back"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                  )}
                  <h3 className="text-sm font-semibold">{isDirectionsInstructionMode ? 'Navigation' : 'Directions'}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDirectionsDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="overflow-y-auto flex-1 overflow-x-hidden">

              {/* Transport Mode Selection (hidden when in Navigation instruction mode) */}
  {!isDirectionsInstructionMode && (
    <div className="mb-4">
      <div className="grid grid-cols-4 gap-2">
        {transportModes.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedTransport === mode.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTransportModeChange(mode.id)}
            className={`relative group h-8 w-full flex items-center justify-center text-xs rounded-full border border-border/30 ${selectedTransport===mode.id ? 'bg-primary/10 text-primary' : 'bg-card/90'}`}
            title={mode.label}
          >
            <mode.icon className="h-4 w-4" />

            <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs bg-popover/95 border border-border/40 text-foreground shadow-sm opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100">
              {mode.label}
            </span>
          </Button>
        ))}
      </div>

    </div>
  )}
              
              <div className={isDirectionsInstructionMode ? 'hidden' : ''}>
              {/* Start Point Input */}
              <div className="mb-4 relative" ref={startSectionRef}>
                <div
                  className={`flex items-center gap-2 mb-2 ${draggingRouteIndex === 0 ? 'opacity-70' : ''} ${dropTargetIndex === 0 ? 'ring-2 ring-primary/30 rounded-lg bg-accent/5' : ''}`}
                  draggable={!useCurrentLocation && !!selectedStartPoint}
                  onDragStart={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDragStart(0, e); }}
                  onDragEnter={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDragEnter(0, e); }}
                  onDragOver={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDragOver(0, e); }}
                  onDragLeave={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDragLeave(0, e); }}
                  onDrop={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDrop(0, e); }}
                  onDragEnd={handleRouteItemDragEnd}
                >
                  {dropTargetIndex === 0 && (<div className="h-1 w-full bg-primary/20 rounded mb-2" />)}
                  <div
                    className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center cursor-grab active:cursor-grabbing"
                    draggable={!useCurrentLocation && !!selectedStartPoint}
                    onDragStart={(e) => { if (!useCurrentLocation && selectedStartPoint) handleRouteItemDragStart(0, e); }}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {/* <span className="text-xs text-muted-foreground">or</span> */}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <UnifiedInput
  placeholder="Enter start point"
  size="sm"
  className="pl-10 pr-12 text-sm rounded-full bg-popover/80 w-full"
                          value={fromLocation}
                          onChange={(val: string) => {
                            if (useCurrentLocation) {
                              setUseCurrentLocation(false);
                            }
                            setFromLocation(val);
                            setResultsLocked(false);
                            setEndPointResults([]);
                            setWaypointResultsMap({});
                            setWaypointSearchResults([]);
                          }}
                          icon={Search}
                          onFocus={() => {
                            setIsStartInputFocused(true);
                            setEndPointResults([]);
                            setWaypointResultsMap({});
                            setWaypointSearchResults([]);
                            // Enter map-pick mode for start
                            setIsSelectingStartFromMap(true);
                            setIsSelectingWaypointFromMap(false);
                            setIsSelectingEndFromMap(false);
                            toast?.info?.('Select start', 'Click on the map to pick the start point.');
                          }}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (startPointResults.length === 0) return;
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setStartHighlightIndex(idx => (idx == null ? 0 : Math.min((idx ?? 0) + 1, startPointResults.length - 1)));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setStartHighlightIndex(idx => (idx == null ? startPointResults.length - 1 : Math.max((idx ?? 0) - 1, 0)));
                            } else if (e.key === 'Enter') {
                              if (startHighlightIndex != null && startPointResults[startHighlightIndex]) {
                                handleStartPointSelect(startPointResults[startHighlightIndex]);
                                setStartPointResults([]);
                                setIsStartInputFocused(false);
                              }
                            } else if (e.key === 'Escape') {
                              setStartPointResults([]);
                              setIsStartInputFocused(false);
                            }
                          }}
                        />

                        {/* Clear selected start point shown inside input when selected */}
                        {selectedStartPoint && (
                          <div
                          
                         
                          onClick={() => { setSelectedStartPoint(null); setFromLocation(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 p-0 flex items-center justify-center rounded-full z-10 bg-transparent hover:bg-transparent hover:shadow-none transition-none"
                          title="Clear start point"
                        >
                            <X className="h-4 w-4 " style={{cursor:"pointer"}} />
                          </div>
                        )}

                        {/* Loader shown when searching and no selection */}
                        {isStartPointSearching && !selectedStartPoint && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                        )}
                      </div>

                      {/* Current location button placed outside the input on the right */}
                      {/* <div className="flex-shrink-0">
                        <Button
                          variant={useCurrentLocation ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/30 bg-card/90"
                          title="Use current location"
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
                
                {/* Start Point Results */}
                <AnimatePresence>
                  {(isStartInputFocused || (startPointResults.length > 0 && !fromLocation.trim())) && !consolidatedActive && !resultsLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={isDirectionsOpen ? "mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50" : "absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50"}
                    >
                      {isStartInputFocused && (hasGeolocationPermission === true || userLocation != null) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!userLocation) {
                              getUserLocation();
                            }
                            if (userLocation) {
                              setUseCurrentLocation(true);
                              setSelectedStartPoint(null);
                              setFromLocation('Current Location');
                            }
                            setStartPointResults([]);
                            setIsStartInputFocused(false);
                          }}
                          className="w-full text-left p-3 border-b border-border/20 hover:bg-accent/5 transition-colors duration-150 flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground">Your location</div>
                            <div className="text-xs text-muted-foreground">Use your current position as start</div>
                          </div>
                        </button>
                      )}

                      {startPointResults
                          .filter(r => r.place_id !== selectedEndPoint?.place_id)
                          .map((result, index) => {
                        const IconComponent = getPlaceIcon(result.type || result.category || '');
                        const isActive = startHighlightIndex === index;
                        return (
                          <motion.button
                            key={result.place_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onMouseEnter={() => setStartHighlightIndex(index)}
                            onMouseLeave={() => setStartHighlightIndex(null)}
                            onClick={() => {
                              handleStartPointSelect(result);
                              setStartPointResults([]);
                              setIsStartInputFocused(false);
                            }}
                            className={`w-full text-left p-3 border-b border-border/20 transition-colors duration-150 flex items-start gap-3 ${isActive ? 'bg-accent/10' : 'hover:bg-accent/5'}`}
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
              
              {/* End Point Input */}
              <div className="mb-4 relative" ref={endSectionRef}>
                <div
                  className={`flex items-center gap-2 mb-2 ${draggingRouteIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length) ? 'opacity-70' : ''} ${dropTargetIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length) ? 'ring-2 ring-primary/30 rounded-lg bg-accent/5' : ''}`}
                  draggable={!!selectedEndPoint}
                  onDragStart={(e) => { if (selectedEndPoint) handleRouteItemDragStart((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  onDragEnter={(e) => { if (selectedEndPoint) handleRouteItemDragEnter((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  onDragOver={(e) => { if (selectedEndPoint) handleRouteItemDragOver((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  onDragLeave={(e) => { if (selectedEndPoint) handleRouteItemDragLeave((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  onDrop={(e) => { if (selectedEndPoint) handleRouteItemDrop((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  onDragEnd={handleRouteItemDragEnd}
                >
                  {dropTargetIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length) && (<div className="h-1 w-full bg-primary/20 rounded mb-2" />)}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing ${waypoints.length > 0 ? 'bg-gray-600/10' : 'bg-red-500/10'}`}
                    draggable={!!selectedEndPoint}
                    onDragStart={(e) => { if (selectedEndPoint) handleRouteItemDragStart((!useCurrentLocation && selectedStartPoint ? 1 : 0) + waypoints.length, e); }}
                  >
                    <div className={`w-2 h-2 rounded-full ${waypoints.length > 0 ? 'bg-gray-600' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <UnifiedInput
                        placeholder="Enter destination"
                        size="sm"
                        className="pl-10 pr-12 text-sm rounded-full bg-popover/80"
                        value={toLocation}
                        onChange={(val: string) => {
                          setToLocation(val);
                          setResultsLocked(false);
                          setStartPointResults([]);
                          setWaypointResultsMap({});
                          setWaypointSearchResults([]);
                        }}
                        icon={Search}
                        onFocus={() => {
                          setIsEndInputFocused(true);
                          setStartPointResults([]);
                          setWaypointResultsMap({});
                          setWaypointSearchResults([]);
                          // Enter map-pick mode for destination
                          setIsSelectingEndFromMap(true);
                          setIsSelectingWaypointFromMap(false);
                          setIsSelectingStartFromMap(false);
                          toast?.info?.('Select destination', 'Click on the map to pick the destination.');
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (endPointResults.length === 0) return;
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setEndHighlightIndex(idx => (idx == null ? 0 : Math.min((idx ?? 0) + 1, endPointResults.length - 1)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setEndHighlightIndex(idx => (idx == null ? endPointResults.length - 1 : Math.max((idx ?? 0) - 1, 0)));
                          } else if (e.key === 'Enter') {
                            if (endHighlightIndex != null && endPointResults[endHighlightIndex]) {
                              handleEndPointSelect(endPointResults[endHighlightIndex]);
                              setEndPointResults([]);
                              setIsEndInputFocused(false);
                            }
                          } else if (e.key === 'Escape') {
                            setEndPointResults([]);
                            setIsEndInputFocused(false);
                          }
                        }}
                      />

                      {/* Clear selected destination shown inside input when selected */}
                      {selectedEndPoint && (
                        <div
                    
                          onClick={() => { setSelectedEndPoint(null); setToLocation(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 p-0 flex items-center justify-center rounded-full z-10 bg-transparent hover:bg-transparent hover:shadow-none transition-none"
                          title="Clear destination"
                        >
                      <X className="h-4 w-4 " style={{cursor:"pointer"}} />
                        </div>
                      )}

                      {isEndPointSearching && !selectedEndPoint && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* End Point Results */}
                <AnimatePresence>
                  {(isEndInputFocused || (endPointResults.length > 0 && !toLocation.trim())) && !consolidatedActive && !resultsLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={isDirectionsOpen ? "mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50" : "absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50"}
>
                      {endPointResults
                          .filter(r => r.place_id !== selectedStartPoint?.place_id)
                          .map((result, index) => {
                        const IconComponent = getPlaceIcon(result.type || result.category || '');
                        const isActive = endHighlightIndex === index;
                        return (
                          <motion.button
                            key={result.place_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onMouseEnter={() => setEndHighlightIndex(index)}
                            onMouseLeave={() => setEndHighlightIndex(null)}
                            onClick={() => {
                              handleEndPointSelect(result);
                              setEndPointResults([]);
                              setIsEndInputFocused(false);
                            }}
                            className={`w-full text-left p-2 border-b border-border/30 transition-colors duration-150 flex items-center gap-2 ${isActive ? 'bg-accent/20' : 'hover:bg-accent/30'}`}
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
                </AnimatePresence>
              </div>
              
              {/* Middle Destinations Section - inputs like destination input */}
              {waypoints.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-3">
                    {waypoints.map((waypoint, index) => (
                      <div
                      key={index}
                      draggable
                      ref={(el) => { const m = waypointSectionRefs.current; if (el) m.set(index, el); else m.delete(index); }}
                      onDragStart={(e) => handleRouteItemDragStart((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index, e)}
                      onDragEnter={(e) => handleRouteItemDragEnter((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index, e)}
                      onDragOver={(e) => handleRouteItemDragOver((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index, e)}
                      onDragLeave={(e) => handleRouteItemDragLeave((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index, e)}
                      onDrop={(e) => handleRouteItemDrop((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index, e)}
                      onDragEnd={handleRouteItemDragEnd}
                      className={`flex items-start gap-2 ${draggingRouteIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index) ? 'opacity-70' : ''} ${dropTargetIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index) ? 'ring-2 ring-primary/30 rounded-lg bg-accent/5' : ''}`}
                    >
                      {dropTargetIndex === ((!useCurrentLocation && selectedStartPoint ? 1 : 0) + index) && (<div className="h-1 w-full bg-primary/20 rounded mb-2" />)}
                        <div className={`w-6 mt-2 h-6 rounded-full flex items-center justify-center cursor-grab ${index === waypoints.length - 1 ? 'bg-red-500/10' : 'bg-gray-600/10'}`}>
                          <div className={`w-2 h-2 rounded-full ${index === waypoints.length - 1 ? 'bg-red-500' : 'bg-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <UnifiedInput
                              placeholder={`Middle destination ${index + 1}`}
                              size="sm"
                              className="pl-10 pr-12 text-sm rounded-full bg-popover/80 w-full"
                              value={waypoint.display_name}
                              onChange={(val: string) => handleWaypointInputChange(index, val)}
                              icon={Search}
                              onFocus={() => setWaypointInputFocus(prev => ({ ...prev, [index]: true }))}
                            />

                            {/* Loader shown when searching for this waypoint */}
                            {waypointSearchingMap[index] && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                            )}

                            {/* Clear button inside input */}
                            <div onClick={() => removeWaypoint(index)} className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-7 p-0 z-10 bg-transparent hover:bg-transparent hover:shadow-none transition-none">
                             <X className="h-4 w-4 " style={{cursor:"pointer"}} />
                            </div>

                          </div>
                        </div>

                        {/* Waypoint Results Dropdown */}
                        <AnimatePresence>
                          {(waypointInputFocus[index] || (Array.isArray(waypointResultsMap[index]) && waypointResultsMap[index].length > 0 && !waypoints[index].display_name.trim())) && !consolidatedActive && !resultsLocked && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={isDirectionsOpen ? "mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50" : "absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50"}
                            >
                              {(waypointResultsMap[index] || [])
                                .filter(r => r.place_id !== selectedStartPoint?.place_id && r.place_id !== selectedEndPoint?.place_id && waypoints.every((w, i) => i === index || w.place_id !== r.place_id))
                                .map((result, rIndex) => {
                                  const IconComponent = getPlaceIcon(result.type || result.category || '');
                                  return (
                                    <motion.button
                                      key={result.place_id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: rIndex * 0.03 }}
                                      onClick={() => {
                                        handleWaypointResultSelect(index, result);
                                      }}
                                      className="w-full text-left p-2 border-b border-border/30 transition-colors duration-150 flex items-center gap-2 hover:bg-accent/30"
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
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Consolidated Results Panel placed below inputs and above calculate buttons */}
              {consolidatedActive && (
                <div className="mb-4">
                  <div className="bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">Search results</div>
                    <div className="divide-y divide-border/20">
                      {consolidatedResults.map((item, idx) => {
                        const IconComponent = getPlaceIcon(item.result.type || item.result.category || '');
                        return (
                          <button
                            key={`${item.type}-${item.result.place_id}-${idx}`}
                            onClick={() => handleConsolidatedSelect(item)}
                            className="w-full text-left p-2 flex items-start gap-3 hover:bg-accent/10 transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type==='start' ? 'bg-green-500/10' : item.type==='end' ? 'bg-red-500/10' : 'bg-gray-500/10'}`}>
                              <IconComponent className={`h-4 w-4 ${item.type==='start' ? 'text-green-500' : item.type==='end' ? 'text-red-500' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-foreground truncate">{item.result.display_name.split(',')[0]}</div>
                              <div className="text-xs text-muted-foreground truncate">{item.result.display_name.split(',').slice(1,3).join(', ')}</div>
                            </div>
                            <div className="text-xs text-muted-foreground ml-2">{item.type === 'waypoint' ? `Middle destination ${item.waypointIndex!+1}` : item.type === 'start' ? 'Start' : 'End'}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Destination Section */}
              {isAddingWaypoint ? (
                <div className="mb-4 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-600/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <UnifiedInput
                          placeholder="Add destination"
                          size="sm"
                          className="pl-10 pr-4 text-sm rounded-full bg-popover/80"
                          value={waypointSearchQuery}
                          onChange={(val: string) => { setWaypointSearchQuery(val); setResultsLocked(false); }}
                          icon={Search}
                          onFocus={() => {
                            setIsSelectingWaypointFromMap(true);
                            // Clear other result lists so waypoint search shows fresh results
                            setStartPointResults([]);
                            setEndPointResults([]);
                            setWaypointResultsMap({});
                            setWaypointSearchResults([]);
                            toast?.info?.('Select destination', 'Click on the map to pick another destination.');
                          }}
                          onClick={() => {
                            setIsSelectingWaypointFromMap(true);
                            // Clear other result lists so waypoint search shows fresh results
                            setStartPointResults([]);
                            setEndPointResults([]);
                            setWaypointResultsMap({});
                            setWaypointSearchResults([]);
                            toast?.info?.('Select destination', 'Click on the map to pick another destination.');
                          }}
                        />

                        {isWaypointSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary animate-spin" />
                        )}
                        {/* {isSelectingWaypointFromMap && (
                          <div className="mt-2 text-xs text-muted-foreground">Click on the map to place the waypoint, or type to search. Press Esc to cancel.</div>
                        )} */}
                      </div>
                    </div>

                    {/* Close button outside the input box */}
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        aria-label="Close destination input"
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

                  {/* Destination search results */}
                  <AnimatePresence>
                    {waypointSearchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={isDirectionsOpen ? "mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50" : "absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[40vh] sm:max-h-40 overflow-y-auto overscroll-contain z-50"}
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
                                // Ensure add-input is closed and Add destination button is visible
                                setIsAddingWaypoint(false);
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

                  <div className="mt-3">
                    {renderCalculateRouteButton("w-full")}
                  </div>
                </div>
              ) : canShowAddDestinationButton ? (
                <div className="mb-4">
                  <div className="flex gap-2 flex-nowrap">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (waypoints.length >= 10) return;
                        // Open a blank input for the user to add another destination
                        setWaypointSearchQuery("");
                        setWaypointSearchResults([]);
                        setIsSelectingWaypointFromMap(false);
                        setIsAddingWaypoint(true);
                        // Inform user they can type or pick from map
                        toast?.info?.('Add destination', 'Type to search or click the map to add another destination.');
                      }}
                      disabled={waypoints.length >= 10}
                      className="flex-1 h-9 text-sm px-4 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:translate-y-0 transform whitespace-nowrap min-w-[9rem] flex-shrink-0"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add destination
                    </Button>
                    {renderCalculateRouteButton("flex-1")}
                  </div>
                  {waypoints.length >= 10 && (
                    <div className="text-xs text-muted-foreground">Maximum of 10 additional destinations reached</div>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  {renderCalculateRouteButton("w-full")}
                </div>
              )}
              
              {/* Route Options - Google Maps Style */}
              {isRouting && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Finding alternative routes...
                </div>
              )}
              {availableRoutes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Suggested Routes</h4>
                  <div className="space-y-2">
                    {availableRoutes.map((route, index) => {
                      const isSelected = index === selectedRouteIndex;
                      const resolveThemeAccent = () => {
                        try {
                          const el = document.querySelector('.maplibregl-map') || document.documentElement;
                          const raw = getComputedStyle(el).getPropertyValue('--primary')?.trim();
                          if (raw) return `hsl(${raw})`;
                        } catch (e) {}
                        return '#036A38';
                      };
                      const themeAccent = resolveThemeAccent();
                      const color = isSelected ? themeAccent : routeColors[index % routeColors.length];
                      
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
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">
                                {(() => {
                                const via = extractViaFromInstructions(route.instructions);
                                if (via) return `via ${via}`;
                                if (selectedEndPoint?.display_name) return `via ${selectedEndPoint.display_name.split(',')[0]}`;
                                return `Route ${index + 1}`;
                              })() }
                              </span>
                              {index === 0 && (
                                <span className="ml-2 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                  Fastest
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDurationMs(route.time)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-muted-foreground">
                              {(route.distance / 1000).toFixed(1)} km
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-7 px-3 text-xs transition-colors ${
                                isSelected && isRouteStepsVisible
                                  ? 'bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90'
                                  : ''
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRouteNavigateClick(index, isSelected);
                              }}
                            >
                              View steps
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>

              {/* Route Summary */}
              {routeInfo && isDirectionsInstructionMode && (
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
                      {(() => {
                        const via = extractViaFromInstructions(routeInfo?.instructions);
                        if (via) return <div className="text-xs text-muted-foreground mt-1">via {via}</div>;
                        if (selectedEndPoint?.display_name) return <div className="text-xs text-muted-foreground mt-1">via {selectedEndPoint.display_name.split(',')[0]}</div>;
                        return null;
                      })()}
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
                </div>
              )}
              
              {/* Turn-by-turn Directions */}
              {(isDirectionsInstructionMode || isRouteStepsVisible) && directionSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Navigation instructions</h4>
                  <div className="space-y-2">
                    {directionSteps.map((step, index) => {
                      const IconComponent = getDirectionIcon(step.sign);
                      const isActive = index === activeInstructionIndex;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => focusOnInstruction(step, index)}
                          className={`w-full text-left flex items-start gap-2 p-2 rounded-lg border transition-colors ${
                            isActive
                              ? 'bg-primary/10 border-primary/40 shadow-sm'
                              : 'bg-muted/30 border-border/40 hover:bg-muted/50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isActive ? 'bg-primary/20' : 'bg-primary/10'
                            }`}
                          >
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground">{step.instruction}</div>
                            {(step.distance > 0 || step.time > 0) && (
                              <div className="text-[11px] text-muted-foreground">
                                {step.distance > 0 && (
                                  <>{step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}</>
                                )}
                                {step.time > 0 && (
                                  <>{step.distance > 0 ? ' • ' : ''}{formatDurationMs(step.time)}</>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {(isDirectionsInstructionMode || isRouteStepsVisible) && directionSteps.length === 0 && (
                <div className="text-xs text-muted-foreground">Navigation instructions are not available for this route.</div>
              )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile & Layers Buttons */}
      <div className="absolute bottom-4 left-4 z-50 hidden sm:flex flex-col gap-2" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Profile/Menu Button */}
        <Button
          variant="ghost"
          onClick={() => setIsMenuOpen((prev) => { const next = !prev; if (next) { setShowLayerPanel(false); clearAll(); } return next; })}
          className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center transition"
          title="Menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Layers Button */}
        <Button
          variant="ghost"
          onClick={() => setShowLayerPanel((prev) => { const next = !prev; if (next) { setIsMenuOpen(false); clearAll(); } return next; })}
          className="h-10 w-10 backdrop-blur-sm bg-card/60 border border-border/40 rounded-full shadow-sm p-1 flex items-center justify-center transition"
          title="Map style"
        >
          {showLayerPanel ? <X className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
        </Button>
      </div>

      {/* Profile/Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.09, ease: 'easeOut' }}
            className="absolute bottom-28 left-4 z-50 origin-bottom-left" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-0 w-72 origin-bottom-left overflow-hidden">
              {/* Header with Logo */}
              <div className="bg-[] backdrop-blur-md px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo/logo.png" alt="NINja Map" className="h-6 w-6 object-contain" />
                  <span className="text-primary-foreground font-bold text-lg">NINjaMap</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)} className="h-7 w-7 p-0 text-primary-foreground hover:bg-primary-foreground/20">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Card */}
              {user ? (
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <div className="px-4 py-4 border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0 overflow-hidden">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{user.fullName || 'User'}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.phoneNumber || user.email}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ) : (
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <div className="px-4 py-4 border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground flex-shrink-0">
                        <User className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">Guest User</div>
                        <div className="text-sm text-muted-foreground">Sign in to continue</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Menu Items */}
              <div className="py-2">
                {/* My Places */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toast?.info?.('Coming soon', 'My Places feature will be available soon!');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">My Places</span>
                </button>

                {/* Recent Searches */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toast?.info?.('Coming soon', 'Recent Searches feature will be available soon!');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Recent Searches</span>
                </button>

                {/* My Contribution */}
                <Link to="/my-contribution" onClick={() => setIsMenuOpen(false)}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">My Contribution</span>
                  </button>
                </Link>

                {/* Help & Feedback */}
                <Link to="/faqs" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Help & Feedback</span>
                  </button>
                </Link>

                {/* About NINja Map */}
                <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">About NINja Map</span>
                  </button>
                </Link>

             

                {/* Logout */}
                {user && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Handle logout
                      localStorage.removeItem('authToken');
                      window.dispatchEvent(new Event('authChange'));
                      toast?.success?.('Logged out', 'You have been logged out successfully');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors border-t border-border/50 mt-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <LogOut className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-red-500">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer Selection Overlay */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.09, ease: 'easeOut' }}
          className="absolute bottom-16 left-4 z-50 origin-bottom-left" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-2xl shadow-md p-3 w-56 sm:w-64 origin-bottom-left overflow-hidden">
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
                      {typeof layer.preview === 'string' ? (
                        <img src={layer.preview || '/placeholder.svg'} alt={`${layer.name} preview`} className="h-full w-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.svg'}} />
                      ) : (
                        <div className="h-full w-full">{layer.preview}</div>
                      )}
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
      <div className="absolute bottom-4 right-4 z-50 hidden sm:flex flex-col gap-3 items-end" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
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

      {/* Navigation Banner */}
      <AnimatePresence>
        {isNavigating && routeInfo && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute top-14 left-4 right-4 z-40" style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg backdrop-blur-xl mx-auto max-w-full sm:max-w-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation2 className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">Navigation Active</div>
                    <div className="text-xs opacity-90">
                      {routeInfo.distance} km • {formatMinutes(routeInfo.time)}
                    </div>
                    {(() => {
                      const via = extractViaFromInstructions(routeInfo?.instructions);
                      if (via) return <div className="text-xs opacity-90">via {via}</div>;
                      if (selectedEndPoint?.display_name) return <div className="text-xs opacity-90">via {selectedEndPoint.display_name.split(',')[0]}</div>;
                      return null;
                    })()}
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
          instructionPoint={activeInstructionLocation}
          onRouteClick={selectRoute}
          onRouteMarkerDrag={handleRouteMarkerDrag}
          isDark={isDark}
          selectedTransport={selectedTransport}
          walkingPaths={walkingPaths}
        />
        
        {/* Grid Overlay */}
        <GridOverlay
          map={map}
          isVisible={isGridVisible}
          isDark={isDark}
          isLayerMode={mapLayer === "grid"}
        />
      </div>
    </div>
  );
}
