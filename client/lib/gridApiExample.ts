import { useState } from 'react';
import { generateMapGrid, createGridBounds } from './userApi';
import type { GridBounds } from './http';

/**
 * Example usage of the grid generation API
 */
export async function exampleGridGeneration() {
  try {
    // Example 1: Using the exact bounds from your API example
    const exactBounds: GridBounds = {

   "leftBottomLat": 6.462807379918416,

  "leftBottomLon": 3.417857105123172,
 
  "leftTopLat": 6.463708280818416,

  "leftTopLon": 3.417857105123172,
 
  "rightTopLat": 6.463708280818416,

  "rightTopLon": 3.418763705123172,
 
  "rightBottomLat": 6.462807379918416,

  "rightBottomLon": 3.418763705123172

}



    console.log('Generating grid with exact bounds...');
    const gridResponse = await generateMapGrid(exactBounds);
    
    console.log('Grid generation successful!');
    console.log(`Generated ${gridResponse.totalCells} cells`);
    console.log(`Grid dimensions: ${gridResponse.gridDimensions}`);
    console.log(`Total area: ${gridResponse.totalAreaSquareMeters.toFixed(2)} square meters`);
    
    return gridResponse;

  } catch (error) {
    console.error('Grid generation failed:', error);
    throw error;
  }
}

/**
 * Example 2: Using the helper function to create bounds
 */
export async function exampleGridGenerationWithHelper() {
  try {
    // Define southwest and northeast corners
    const southWest = {
      latitude: 6.453369435637782,
      longitude: 3.4163434352230695
    };
    
    const northEast = {
      latitude: 6.453902478073502,
      longitude: 3.416584834043988
    };

    // Create bounds using helper function
    const bounds =  {

        "leftBottomLat": 6.462807379918416,

        "leftBottomLon": 3.417857105123172,

        "leftTopLat": 6.463708280818416,

        "leftTopLon": 3.417857105123172,

        "rightTopLat": 6.463708280818416,

        "rightTopLon": 3.418763705123172,

        "rightBottomLat": 6.462807379918416,

        "rightBottomLon": 3.418763705123172

      }
    
    console.log('Generating grid with helper function...');
    const gridResponse = await generateMapGrid(bounds);
    
    console.log('Grid generation successful!');
    console.log(`Generated ${gridResponse.totalCells} cells`);
    console.log(`Grid dimensions: ${gridResponse.gridDimensions}`);
    
    // Access individual grid cells
    gridResponse.gridCells.forEach((cell, index) => {
      if (index < 3) { // Log first 3 cells as example
        console.log(`Cell ${cell.cellId}: ${cell.blockCode} at ${cell.center.latitude}, ${cell.center.longitude}`);
      }
    });
    
    return gridResponse;

  } catch (error) {
    console.error('Grid generation failed:', error);
    throw error;
  }
}

/**
 * Example 3: React hook usage pattern
 */
export function useGridGeneration() {
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [error, setError] = useState(null);

  const generateGrid = async (bounds: GridBounds) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generateMapGrid(bounds);
      setGridData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateGrid,
    loading,
    gridData,
    error,
    clearError: () => setError(null),
    clearData: () => setGridData(null)
  };
}