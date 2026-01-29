/**
 * Debug test for grid generation and display
 * This file helps debug grid generation issues
 */

import { generateMapGrid, createGridBounds } from './userApi';

/**
 * Test grid generation with current map bounds
 */
export async function testGridWithMapBounds(map: any) {
  if (!map) {
    console.error('❌ No map provided for testing');
    return null;
  }

  try {
    console.log('🧪 Testing grid generation with current map bounds...');
    
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    console.log('📍 Map bounds:', {
      southwest: { lat: sw.lat, lng: sw.lng },
      northeast: { lat: ne.lat, lng: ne.lng }
    });

    const gridBounds = createGridBounds(
      { latitude: sw.lat, longitude: sw.lng },
      { latitude: ne.lat, longitude: ne.lng }
    );

    console.log('📋 Grid bounds payload:', gridBounds);

    const result = await generateMapGrid(gridBounds);
    
    console.log('✅ Grid generation test successful!');
    console.log('📊 Result summary:', {
      totalCells: result.totalCells,
      dimensions: result.gridDimensions,
      area: result.totalAreaSquareMeters,
      firstCell: result.gridCells[0] ? {
        id: result.gridCells[0].cellId,
        blockCode: result.gridCells[0].blockCode,
        center: result.gridCells[0].center
      } : null
    });

    return result;
  } catch (error) {
    console.error('❌ Grid generation test failed:', error);
    return null;
  }
}

/**
 * Test grid data structure validation
 */
export function validateGridData(gridData: any) {
  console.log('🔍 Validating grid data structure...');
  
  if (!gridData) {
    console.error('❌ No grid data provided');
    return false;
  }

  const requiredFields = ['gridCells', 'totalCells', 'gridDimensions', 'totalAreaSquareMeters'];
  const missingFields = requiredFields.filter(field => !(field in gridData));
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    return false;
  }

  if (!Array.isArray(gridData.gridCells)) {
    console.error('❌ gridCells is not an array');
    return false;
  }

  if (gridData.gridCells.length === 0) {
    console.error('❌ No grid cells in data');
    return false;
  }

  // Validate first cell structure
  const firstCell = gridData.gridCells[0];
  const requiredCellFields = ['cellId', 'blockCode', 'center', 'polylineAsArray'];
  const missingCellFields = requiredCellFields.filter(field => !(field in firstCell));
  
  if (missingCellFields.length > 0) {
    console.error('❌ Missing cell fields:', missingCellFields);
    return false;
  }

  console.log('✅ Grid data structure is valid');
  console.log('📊 Grid data summary:', {
    totalCells: gridData.totalCells,
    actualCells: gridData.gridCells.length,
    dimensions: gridData.gridDimensions,
    firstCellId: firstCell.cellId,
    firstCellCenter: firstCell.center
  });

  return true;
}

/**
 * Test coordinate conversion for map display
 */
export function testCoordinateConversion(gridData: any) {
  console.log('🗺️ Testing coordinate conversion...');
  
  if (!validateGridData(gridData)) {
    return false;
  }

  const firstCell = gridData.gridCells[0];
  console.log('📍 First cell raw coordinates:', firstCell.polylineAsArray);
  
  // Test coordinate conversion
  const convertedCoords = firstCell.polylineAsArray.map((coord: number[]) => {
    const lng = typeof coord[1] === 'number' ? coord[1] : coord[0];
    const lat = typeof coord[0] === 'number' ? coord[0] : coord[1];
    return [lng, lat];
  });
  
  console.log('📍 Converted coordinates:', convertedCoords);
  
  // Validate coordinate ranges
  const validCoords = convertedCoords.every(([lng, lat]: [number, number]) => {
    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
  });
  
  if (!validCoords) {
    console.error('❌ Invalid coordinate ranges detected');
    return false;
  }
  
  console.log('✅ Coordinate conversion successful');
  return true;
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testGridWithMapBounds = testGridWithMapBounds;
  (window as any).validateGridData = validateGridData;
  (window as any).testCoordinateConversion = testCoordinateConversion;
  
  console.log('🔧 Grid debug functions available:');
  console.log('  - window.testGridWithMapBounds(map)');
  console.log('  - window.validateGridData(gridData)');
  console.log('  - window.testCoordinateConversion(gridData)');
}