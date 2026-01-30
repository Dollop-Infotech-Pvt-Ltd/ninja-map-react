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
}

export function GridOverlay({
  map,
  isVisible,
  isDark,
  isLayerMode = false,
}: GridOverlayProps) {
  const [gridData, setGridData] = useState<GridApiResponse[] | null>(null);
  const [gridOpacity] = useState(isLayerMode ? 0.1 : 0.5); // 50% opacity for auto grid, 10% for layer mode
  const [showLabels] = useState(true);
  const [gridColor] = useState(isLayerMode ? "#00FF00" : "#036A38"); // Pure green for layer mode
  const [autoGridEnabled] = useState(true);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [defaultFillColor] = useState("#036A38");
  const lastGridBoundsRef = useRef<string | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const gridSourceId = "grid-source";
  const gridLayerId = "grid-layer";
  const gridLabelsLayerId = "grid-labels-layer";
  const gridSourceAdded = useRef(false);

  // Function to check if grid should be visible (only at full zoom)
  const shouldShowGrid = (): boolean => {
    if (!map) return false;
    const currentZoom = map.getZoom();
    return currentZoom >= 18;
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

    // Only show grid when at full zoom level
    if (!shouldShowGrid()) {
      console.log("🚫 Not showing grid - zoom level too low");
      return;
    }

    console.log("🗺️ Adding grid to map...", {
      mapExists: !!map,
      gridDataExists: !!gridData,
      isVisible,
      gridCellCount: gridData.length,
      currentZoom: map.getZoom()
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

        // Create labels GeoJSON for all cells
        const labelFeatures = gridData.map((gridItem) => ({
          type: "Feature" as const,
          properties: {
            cellId: gridItem.gridCell.cellId,
            blockCode: gridItem.blockCode,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [gridItem.center.longitude, gridItem.center.latitude],
          },
        }));

        const labelsGeoJSON = {
          type: "FeatureCollection" as const,
          features: labelFeatures,
        };

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

        // Add labels source
        const labelsSourceId = `${gridSourceId}-labels`;
        if (!map.getSource(labelsSourceId)) {
          console.log("➕ Adding labels source to map");
          map.addSource(labelsSourceId, {
            type: "geojson",
            data: labelsGeoJSON,
          });
        } else {
          console.log("🔄 Updating existing labels source");
          (map.getSource(labelsSourceId) as maplibregl.GeoJSONSource).setData(
            labelsGeoJSON,
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

        // Add fill layer for grid cells with conditional coloring
        const gridFillLayerId = `${gridLayerId}-fill`;
        if (!map.getLayer(gridFillLayerId)) {
          console.log("➕ Adding grid fill layer to map");
          map.addLayer({
            id: gridFillLayerId,
            type: "fill",
            source: gridSourceId,
            layout: {},
            paint: {
              "fill-color": [
                "case",
                ["in", ["get", "cellId"], ["literal", Array.from(selectedBlocks)]],
                defaultFillColor, // Selected blocks use default fill color
                gridColor // Unselected blocks use grid color
              ],
              "fill-opacity": [
                "case",
                ["in", ["get", "cellId"], ["literal", Array.from(selectedBlocks)]],
                gridOpacity, // Selected blocks use same opacity as grid
                gridOpacity * 0.2 // Unselected blocks less opaque
              ],
            },
          });
        } else {
          console.log("🔄 Updating grid fill layer properties");
          map.setPaintProperty(gridFillLayerId, "fill-color", [
            "case",
            ["in", ["get", "cellId"], ["literal", Array.from(selectedBlocks)]],
            defaultFillColor,
            gridColor
          ]);
          map.setPaintProperty(gridFillLayerId, "fill-opacity", [
            "case",
            ["in", ["get", "cellId"], ["literal", Array.from(selectedBlocks)]],
            gridOpacity, // Selected blocks use same opacity as grid
            gridOpacity * 0.2
          ]);
        }

        // Add labels layer
        if (showLabels && !map.getLayer(gridLabelsLayerId)) {
          console.log("➕ Adding grid labels layer to map");
          map.addLayer({
            id: gridLabelsLayerId,
            type: "symbol",
            source: labelsSourceId,
            layout: {
              "text-field": ["get", "cellId"],
              "text-font": ["Open Sans Regular"],
              "text-size": 10,
              "text-anchor": "center",
              "text-allow-overlap": false,
              "text-ignore-placement": false,
            },
            paint: {
              "text-color": isDark ? "#ffffff" : "#000000",
              "text-halo-color": isDark ? "#000000" : "#ffffff",
              "text-halo-width": 1,
              "text-opacity": 0, // Hide labels by default
            },
          });
        } else if (showLabels && map.getLayer(gridLabelsLayerId)) {
          console.log("🔄 Updating grid labels layer properties");
          map.setPaintProperty(gridLabelsLayerId, "text-opacity", 0); // Keep labels hidden
          map.setPaintProperty(
            gridLabelsLayerId,
            "text-color",
            isDark ? "#ffffff" : "#000000",
          );
          map.setPaintProperty(
            gridLabelsLayerId,
            "text-halo-color",
            isDark ? "#000000" : "#ffffff",
          );
        }

        // Add click handler for grid cells (single selection mode)
        const handleGridClick = (e: maplibregl.MapMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: [`${gridLayerId}-fill`],
          });
          if (features.length > 0) {
            const feature = features[0];
            const props = feature.properties;
            const cellId = props?.cellId;

            if (cellId) {
              // Single selection mode - clear all others and select only this one
              setSelectedBlocks(prev => {
                const wasSelected = prev.has(cellId);
                if (wasSelected) {
                  // If clicking the same block, deselect it
                  console.log(`� Deselected block: ${cellId}`);
                  return new Set();
                } else {
                  // Select only this block, clear all others
                  console.log(`🟨 Selected block: ${cellId} - filled with ${defaultFillColor} (cleared others)`);
                  return new Set([cellId]);
                }
              });
            }

            // Find the corresponding grid data to get the center coordinates
            const clickedCell = gridData.find(item => item.gridCell.cellId === props?.cellId);
            const centerCoords: [number, number] = clickedCell ? 
              [clickedCell.center.longitude, clickedCell.center.latitude] : 
              [e.lngLat.lng, e.lngLat.lat];

            // Create popup at the center of the grid cell
            new maplibregl.Popup({
              className: 'grid-click-popup'
            })
              .setLngLat(centerCoords)
              .setHTML(
                `
                <div class="px-3 py-2">
                  <div class="text-sm font-semibold text-foreground">
                    ${props?.blockCode || "N/A"}
                  </div>
              
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

        // Fit map to show all grid cells with no padding (use full screen)
        if (gridData.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          gridData.forEach((gridItem) => {
            const cell = gridItem.gridCell;
            bounds.extend([cell.bottomLeft.longitude, cell.bottomLeft.latitude]);
            bounds.extend([cell.topRight.longitude, cell.topRight.latitude]);
          });
          // Use zero padding to utilize full screen dimensions
          map.fitBounds(bounds, { padding: 0 });
        }

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
  }, [map, gridData, isVisible, gridOpacity, showLabels, gridColor, isDark, selectedBlocks, defaultFillColor]);

  // Remove grid from map when not visible
  useEffect(() => {
    if (!map || isVisible) return;

    try {
      // Remove layers
      [gridLayerId, `${gridLayerId}-fill`, gridLabelsLayerId].forEach(
        (layerId) => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        },
      );

      // Remove sources
      [gridSourceId, `${gridSourceId}-labels`].forEach((sourceId) => {
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
      
      // Only proceed if we're at full zoom (18+)
      if (currentZoom >= 18 && autoGridEnabled) {
        const currentCenterKey = getCenterKey();
        
        // Only load if center has changed significantly (user scrolled/moved map)
        if (lastGridBoundsRef.current !== currentCenterKey) {
          // Clear existing throttle timeout
          if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
          }
          
          // Throttle API calls - wait 500ms after last movement
          throttleTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Loading grid after map movement at full zoom (zoom ≥18)");
            lastGridBoundsRef.current = currentCenterKey;
            handleGridGenerate();
          }, 500);
        }
      } else if (currentZoom < 18) {
        // Clear grid data when not at full zoom
        if (gridData) {
          console.log("🧹 Clearing grid data - zoom level below 18");
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
      console.log(`🔍 Zoom ended at level: ${currentZoom.toFixed(1)}`);
      
      // When reaching full zoom, load grid immediately if we don't have data
      if (currentZoom >= 18 && autoGridEnabled && !gridData) {
        console.log("📍 Reached full zoom - loading grid immediately");
        const currentCenterKey = getCenterKey();
        lastGridBoundsRef.current = currentCenterKey;
        handleGridGenerate();
      } else if (currentZoom < 18 && gridData) {
        // Clear grid when zooming out
        console.log("🧹 Clearing grid data - zoomed out below level 18");
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

  // Load grid immediately when layer is first activated at full zoom
  useEffect(() => {
    if (!map || !isVisible || !autoGridEnabled) return;
    
    const currentZoom = map.getZoom();
    
    // If grid layer is activated and we're at full zoom, load grid immediately
    if (currentZoom >= 18 && !gridData) {
      console.log("🎯 Grid layer activated at full zoom - loading grid immediately");
      const currentCenterKey = getCenterKey();
      lastGridBoundsRef.current = currentCenterKey;
      handleGridGenerate();
    }
  }, [isVisible, map, autoGridEnabled, gridData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map && gridSourceAdded.current) {
        try {
          [gridLayerId, `${gridLayerId}-fill`, gridLabelsLayerId].forEach(
            (layerId) => {
              if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
              }
            },
          );
          [gridSourceId, `${gridSourceId}-labels`].forEach((sourceId) => {
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
    console.log("🚀 Calling your specific grid API...");
    
    if (!map) {
      console.error("Map not available");
      return;
    }

    try {
      // Get current map bounds (full screen area - use 100% of visible area)
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      // Use full screen area (100% of visible area for maximum grid coverage)
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

      console.log("📍 Full Screen Grid API payload:", payload);
      console.log("🎯 Map bounds:", { 
        southwest: { lat: sw.lat, lng: sw.lng },
        northeast: { lat: ne.lat, lng: ne.lng }
      });
      console.log("📏 Grid area: Full visible screen area");

      const response = await axios.post(GRID_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📊 Raw API response:", response.data);

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
      
      console.log("✅ Grid API call successful!");
      console.log("📊 Processed grid data:", result.length, "cells:", result);
    } catch (error: any) {
      console.error("❌ Grid API call failed:", error);
      
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

      console.error("Grid API Error:", errorMessage);
      // Clear grid data on error
      setGridData(null);
    }
  };
  return null; // No UI controls needed - grid is managed by layer selection
}
