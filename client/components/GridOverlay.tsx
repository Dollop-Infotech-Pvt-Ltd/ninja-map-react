import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { GRID_API_URL } from "@/lib/APIConstants";
import type { GridApiResponse } from "@shared/api";
import axios from "axios";

interface GridOverlayProps {
  map: maplibregl.Map | null;
  isVisible: boolean;
  isDark?: boolean;
  isLayerMode?: boolean; // New prop to indicate if used as a layer
  isSatelliteMode?: boolean; // New prop for satellite grid mode
}

export function GridOverlay({
  map,
  isVisible,
  isDark,
  isLayerMode = false,
  isSatelliteMode = false,
}: GridOverlayProps) {
  const [gridData, setGridData] = useState<GridApiResponse[] | null>(null);
  const [gridOpacity] = useState(isLayerMode ? (isSatelliteMode ? 0.8 : 0.1) : 0.5); // Higher opacity for satellite mode
  const [gridColor] = useState(
    isLayerMode 
      ? (isSatelliteMode ? "#00FF00" : "#00FF00") // Bright green for both grid modes
      : "#036A38"
  ); // Pure green for layer mode
  const [autoGridEnabled] = useState(true);
  const lastGridBoundsRef = useRef<string | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: Log when props change
  useEffect(() => {
    console.log("🔧 GridOverlay props updated:", {
      isVisible,
      isSatelliteMode,
      isLayerMode,
      gridOpacity,
      gridColor,
      mode: isSatelliteMode ? "🛰️ SATELLITE" : "🗺️ OSM"
    });
  }, [isVisible, isSatelliteMode, isLayerMode, gridOpacity, gridColor]);

  const gridSourceId = "grid-source";
  const gridLayerId = "grid-layer";
  const gridSourceAdded = useRef(false);

  // Function to check if grid should be visible (at full zoom only)
  const shouldShowGrid = (): boolean => {
    if (!map) return false;
    const currentZoom = map.getZoom();
    
    // Show grid only at maximum zoom levels:
    // - Satellite: zoom 18 (max zoom)
    // - OSM: zoom 20 (max zoom)
    if (isSatelliteMode) {
      return currentZoom >= 18; // Satellite max zoom is 18
    } else {
      return currentZoom >= 20; // OSM max zoom is 20 (full zoom)
    }
  };

  // Function to generate a unique key for current center position
  const getCenterKey = (): string => {
    if (!map) return "";
    const center = map.getCenter();
    // Round to ~10 meter precision to avoid too frequent updates
    return `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
  };

  // Add grid to map (only show at full zoom)
  useEffect(() => {
    if (!map || !gridData || !isVisible) return;

    // Only show grid when at FULL ZOOM level
    if (!shouldShowGrid()) {
      const requiredZoom = isSatelliteMode ? 18 : 20;
      console.log(`🚫 Not showing grid - zoom level too low (need FULL ZOOM ${requiredZoom}+, current: ${map.getZoom().toFixed(1)}) - ${isSatelliteMode ? 'Satellite' : 'OSM'} mode`);
      return;
    }

    console.log("🗺️ Adding grid to map...", {
      mapExists: !!map,
      gridDataExists: !!gridData,
      isVisible,
      gridCellCount: gridData.length,
      currentZoom: map.getZoom(),
      isSatelliteMode,
      isLayerMode,
      gridOpacity,
      gridColor,
      mode: isSatelliteMode ? "🛰️ SATELLITE" : "🗺️ OSM"
    });

    // Wait for map to be ready
    const addGridToMap = () => {
      try {
        // Create GeoJSON from all grid cells
        const features = gridData.map((gridItem) => {
          const cell = gridItem.gridCell;
          
          // Create polygon coordinates from the cell bounds
          const coordinates = [
            [cell.bottomLeft.longitude, cell.bottomLeft.latitude],
            [cell.bottomRight.longitude, cell.bottomRight.latitude],
            [cell.topRight.longitude, cell.topRight.latitude],
            [cell.topLeft.longitude, cell.topLeft.latitude],
            [cell.bottomLeft.longitude, cell.bottomLeft.latitude], // Close the polygon
          ];

          return {
            type: "Feature" as const,
            properties: {
              cellId: cell.cellId,
              blockCode: gridItem.blockCode,
              rowIndex: cell.rowIndex,
              colIndex: cell.colIndex,
              area: cell.areaSquareMeters,
            },
            geometry: {
              type: "Polygon" as const,
              coordinates: [coordinates],
            },
          };
        });

        const gridGeoJSON = {
          type: "FeatureCollection" as const,
          features,
        };

        console.log("📊 Created GeoJSON with", features.length, "grid cells:", gridGeoJSON);

        // Labels source removed - only show grid code on click via tooltip

        // Add source if not exists
        if (!map.getSource(gridSourceId)) {
          console.log("➕ Adding grid source to map");
          map.addSource(gridSourceId, {
            type: "geojson",
            data: gridGeoJSON,
          });
          gridSourceAdded.current = true;
        } else {
          console.log("🔄 Updating existing grid source");
          (map.getSource(gridSourceId) as maplibregl.GeoJSONSource).setData(
            gridGeoJSON,
          );
        }

        // Add grid layer (polygons)
        if (!map.getLayer(gridLayerId)) {
          console.log("➕ Adding grid line layer to map");
          map.addLayer({
            id: gridLayerId,
            type: "line",
            source: gridSourceId,
            layout: {},
            paint: {
              "line-color": gridColor,
              "line-width": 2,
              "line-opacity": gridOpacity,
            },
          });
        } else {
          console.log("🔄 Updating grid line layer properties");
          map.setPaintProperty(gridLayerId, "line-color", gridColor);
          map.setPaintProperty(gridLayerId, "line-opacity", gridOpacity);
        }

        // Add fill layer for grid cells
        const gridFillLayerId = `${gridLayerId}-fill`;
        if (!map.getLayer(gridFillLayerId)) {
          console.log("➕ Adding grid fill layer to map");
          map.addLayer({
            id: gridFillLayerId,
            type: "fill",
            source: gridSourceId,
            layout: {},
            paint: {
              "fill-color": gridColor,
              "fill-opacity": gridOpacity * 0.2,
            },
          });
        } else {
          console.log("🔄 Updating grid fill layer properties");
          map.setPaintProperty(gridFillLayerId, "fill-color", gridColor);
          map.setPaintProperty(gridFillLayerId, "fill-opacity", gridOpacity * 0.2);
        }

        // Labels removed - only show grid code on click via tooltip

        // Add click handler for grid cells - show grid code tooltip only
        const handleGridClick = (e: maplibregl.MapMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: [`${gridLayerId}-fill`],
          });
          if (features.length > 0) {
            const feature = features[0];
            const props = feature.properties;

            // Find the corresponding grid data to get the center coordinates
            const clickedCell = gridData.find(item => item.gridCell.cellId === props?.cellId);
            const centerCoords: [number, number] = clickedCell ? 
              [clickedCell.center.longitude, clickedCell.center.latitude] : 
              [e.lngLat.lng, e.lngLat.lat];

            // Show simple tooltip with grid code
            new maplibregl.Popup({
              className: 'grid-tooltip',
              closeButton: false,
              closeOnClick: true,
              anchor: 'bottom',
              offset: [0, -10]
            })
              .setLngLat(centerCoords)
              .setHTML(
                `
                <div class="px-2 py-1 bg-gray-900 text-white rounded-md shadow-lg text-xs font-mono">
                  ${props?.blockCode || props?.cellId || "N/A"}
                </div>
                `,
              )
              .addTo(map);
          }
        };

        // Define event handlers
        // Change cursor on hover for fill layer (entire block area)
        const handleMouseEnter = () => {
          map.getCanvas().style.cursor = "pointer";
        };

        const handleMouseLeave = () => {
          map.getCanvas().style.cursor = "";
        };

        // Register event listeners
        map.on("click", gridFillLayerId, handleGridClick);
        map.on("mouseenter", gridFillLayerId, handleMouseEnter);
        map.on("mouseleave", gridFillLayerId, handleMouseLeave);

        console.log("✅ Grid successfully added to map!");

        // DON'T fit bounds - keep current map view unchanged
        // This was causing map style to change after grid API call
        console.log("🎯 Grid added without changing map view/style");

        return () => {
          map.off("click", `${gridLayerId}-fill`, handleGridClick);
          map.off("mouseenter", `${gridLayerId}-fill`, handleMouseEnter);
          map.off("mouseleave", `${gridLayerId}-fill`, handleMouseLeave);
        };
      } catch (error) {
        console.error("❌ Error adding grid to map:", error);
        // Clear grid data on error
        setGridData(null);
      }
    };

    // Check if map is ready
    if (map.isStyleLoaded()) {
      console.log("🗺️ Map is ready, adding grid immediately");
      return addGridToMap();
    } else {
      console.log("⏳ Map not ready, waiting for style to load...");
      const onStyleLoad = () => {
        console.log("🗺️ Map style loaded, adding grid now");
        addGridToMap();
      };

      map.once("styledata", onStyleLoad);

      return () => {
        map.off("styledata", onStyleLoad);
      };
    }
  }, [map, gridData, isVisible, gridOpacity, gridColor, isDark, isSatelliteMode, isLayerMode]);

  // Handle map style changes - re-add grid when style loads
  useEffect(() => {
    if (!map || !isVisible) return;

    const handleStyleData = () => {
      console.log("🎨 Map style changed, checking if grid needs to be re-added...", {
        hasGridData: !!gridData,
        isVisible,
        isSatelliteMode,
        isLayerMode,
        currentZoom: map.getZoom()
      });
      
      // If we have grid data and should show grid, re-add it after style change
      // BUT don't change map view/bounds
      if (gridData && shouldShowGrid()) {
        console.log("🔄 Re-adding grid after style change (without changing map view)");
        // Small delay to ensure style is fully loaded
        setTimeout(() => {
          // Trigger re-render by updating a state that will cause the grid effect to run
          // BUT don't change map view or bounds
          console.log("🔄 Re-triggering grid render without changing map view");
          // Force re-render by clearing and setting grid data
          const currentData = gridData;
          setGridData(null);
          setTimeout(() => setGridData(currentData), 50);
        }, 100);
      }
    };

    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, isVisible, gridData, isSatelliteMode, isLayerMode]);

  // Remove grid from map when not visible
  useEffect(() => {
    if (!map || isVisible) return;

    try {
      // Remove layers
      [gridLayerId, `${gridLayerId}-fill`].forEach(
        (layerId) => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        },
      );

      // Remove sources
      [gridSourceId].forEach((sourceId) => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });

      gridSourceAdded.current = false;
    } catch (error) {
      console.warn("Error removing grid from map:", error);
    }
  }, [map, isVisible]);

  // Auto-load grid when layer is selected or when fully zoomed in and map is moved
  useEffect(() => {
    if (!map || !isVisible) return;

    const handleMapMove = () => {
      const currentZoom = map.getZoom();
      const requiredZoom = isSatelliteMode ? 18 : 20; // Full zoom for each mode
      
      // Only proceed if we're at full zoom level
      if (currentZoom >= requiredZoom && autoGridEnabled) {
        const currentCenterKey = getCenterKey();
        
        // Only load if center has changed significantly (user scrolled/moved map)
        if (lastGridBoundsRef.current !== currentCenterKey) {
          // Clear existing throttle timeout
          if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
          }
          
          // Throttle API calls - wait 500ms after last movement
          throttleTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Loading grid after map movement at FULL ZOOM (zoom ≥${requiredZoom}) - ${isSatelliteMode ? 'Satellite' : 'OSM'} mode`);
            console.log("🎯 This will NOT change map view/style - only add grid overlay");
            lastGridBoundsRef.current = currentCenterKey;
            handleGridGenerate();
          }, 500);
        }
      } else if (currentZoom < requiredZoom) {
        // Clear grid data when not at full zoom
        if (gridData) {
          console.log(`🧹 Clearing grid data - zoom level below FULL ZOOM (${requiredZoom})`);
          setGridData(null);
          lastGridBoundsRef.current = null;
          
          // Clear any pending throttled calls
          if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
            throttleTimeoutRef.current = null;
          }
        }
      }
    };

    const handleZoomEnd = () => {
      const currentZoom = map.getZoom();
      const requiredZoom = isSatelliteMode ? 18 : 20; // Full zoom for each mode
      console.log(`🔍 Zoom ended at level: ${currentZoom.toFixed(1)} (FULL ZOOM: ${requiredZoom}) - ${isSatelliteMode ? 'Satellite' : 'OSM'} mode`);
      
      // When reaching FULL ZOOM, load grid immediately if we don't have data
      if (currentZoom >= requiredZoom && autoGridEnabled && !gridData) {
        console.log(`📍 Reached FULL ZOOM - loading grid immediately (${isSatelliteMode ? 'Satellite' : 'OSM'} mode)`);
        const currentCenterKey = getCenterKey();
        lastGridBoundsRef.current = currentCenterKey;
        handleGridGenerate();
      } else if (currentZoom < requiredZoom && gridData) {
        // Clear grid when zooming out from full zoom
        console.log(`🧹 Clearing grid data - zoomed out below FULL ZOOM (${requiredZoom})`);
        setGridData(null);
        lastGridBoundsRef.current = null;
        
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
          throttleTimeoutRef.current = null;
        }
      }
    };

    // Add event listeners
    map.on('moveend', handleMapMove);  // Call API on map movement with throttling
    map.on('zoomend', handleZoomEnd);  // Handle zoom changes and call API when reaching full zoom

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleZoomEnd);
      
      // Clear throttle timeout on cleanup
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    };
  }, [map, isVisible, autoGridEnabled, gridData]);

  // Load grid immediately when layer is first activated at FULL ZOOM
  useEffect(() => {
    if (!map || !isVisible || !autoGridEnabled) return;
    
    const currentZoom = map.getZoom();
    const requiredZoom = isSatelliteMode ? 18 : 20; // Full zoom for each mode
    
    console.log("🎯 Grid layer activation check:", {
      isVisible,
      isSatelliteMode,
      isLayerMode,
      currentZoom,
      requiredZoom,
      hasGridData: !!gridData,
      autoGridEnabled,
      mode: isSatelliteMode ? "Satellite" : "OSM"
    });
    
    // If grid layer is activated and we're at FULL ZOOM, load grid immediately
    if (currentZoom >= requiredZoom && !gridData) {
      console.log("🎯 Grid layer activated at FULL ZOOM - loading grid immediately", {
        isSatelliteMode: isSatelliteMode ? "YES" : "NO",
        isLayerMode: isLayerMode ? "YES" : "NO",
        mode: isSatelliteMode ? "Satellite" : "OSM",
        requiredZoom
      });
      const currentCenterKey = getCenterKey();
      lastGridBoundsRef.current = currentCenterKey;
      handleGridGenerate();
    }
  }, [isVisible, map, autoGridEnabled, gridData, isSatelliteMode, isLayerMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map && gridSourceAdded.current) {
        try {
          [gridLayerId, `${gridLayerId}-fill`].forEach(
            (layerId) => {
              if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
              }
            },
          );
          [gridSourceId].forEach((sourceId) => {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          });
        } catch (error) {
          console.warn("Error cleaning up grid:", error);
        }
      }
      
      // Clear throttle timeout on unmount
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    };
  }, [map]);

  const handleGridGenerate = async () => {
    const currentMode = isSatelliteMode ? '🛰️ SATELLITE' : '🗺️ OSM';
    console.log(`🚀 Calling SAME grid API for ${currentMode} mode...`);
    console.log(`📡 API Endpoint: ${GRID_API_URL}`);
    console.log(`🔧 Mode Detection: isSatelliteMode = ${isSatelliteMode}`);
    
    if (!map) {
      console.error("Map not available");
      return;
    }

    try {
      // Get current map bounds (IDENTICAL for both OSM and Satellite)
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      // Use IDENTICAL payload structure for both modes to ensure same grid size
      const payload = {
        "leftBottomLat": sw.lat,
        "leftBottomLon": sw.lng,
        "leftTopLat": ne.lat,
        "leftTopLon": sw.lng,
        "rightTopLat": ne.lat,
        "rightTopLon": ne.lng,
        "rightBottomLat": sw.lat,
        "rightBottomLon": ne.lng
      };

      console.log(`📍 ${currentMode} Grid API payload (IDENTICAL TO OSM):`, payload);
      console.log("🎯 Map bounds (SAME FOR BOTH MODES):", { 
        southwest: { lat: sw.lat, lng: sw.lng },
        northeast: { lat: ne.lat, lng: ne.lng }
      });
      console.log(`📏 Grid area: IDENTICAL bounds for ${currentMode} mode`);
      console.log(`🔗 Using SAME API endpoint: ${GRID_API_URL}`);
      console.log(`⚖️ This will produce IDENTICAL grid size for both OSM and Satellite modes`);

      const response = await axios.post(GRID_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 ${currentMode} Grid API response (SAME API):`, response.data);

      // Handle the response - it might be an array of grid cells
      let result: GridApiResponse[];
      
      if (Array.isArray(response.data)) {
        // If response is an array, use all items
        result = response.data;
      } else if (response.data.cellsWithCodes && Array.isArray(response.data.cellsWithCodes)) {
        // If response has cellsWithCodes array, use all items
        result = response.data.cellsWithCodes;
      } else {
        // If response is a single object, wrap it in an array
        result = [response.data];
      }

      setGridData(result);
      
      console.log(`✅ ${currentMode} Grid API call successful! (SAME API AS OSM)`);
      console.log("📊 Processed grid data:", result.length, "cells:", result);
      console.log(`🎉 ${currentMode} mode is using the EXACT SAME API as OSM mode!`);
      console.log("🎯 Map style will NOT be changed - keeping current view");
      
      // Log grid size information - SHOULD BE IDENTICAL FOR BOTH MODES
      if (result.length > 0) {
        const firstCell = result[0];
        const area = firstCell.gridCell?.areaSquareMeters;
        if (area) {
          const sideLength = Math.sqrt(area);
          console.log(`📏 ${currentMode} Grid Square Size: ${area.toFixed(2)} m² (${sideLength.toFixed(1)} x ${sideLength.toFixed(1)} meters)`);
          console.log(`⚖️ This size should be IDENTICAL to OSM grid size!`);
        }
      }
    } catch (error: any) {
      console.error(`❌ ${currentMode} Grid API call failed:`, error);
      
      let errorMessage = "Failed to fetch grid data";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for common network issues
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        errorMessage = "Network error - check if grid API server is running at https://api.ninja-map.dollopinfotech.com";
      } else if (error.response?.status === 404) {
        errorMessage = "Grid API endpoint not found - check server configuration";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error - check grid API server logs";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = "Connection refused - grid API server may be down";
      }

      console.error(`${currentMode} Grid API Error:`, errorMessage);
      // Clear grid data on error
      setGridData(null);
    }
  };
  return null; // No UI controls needed - grid is managed by layer selection
}
