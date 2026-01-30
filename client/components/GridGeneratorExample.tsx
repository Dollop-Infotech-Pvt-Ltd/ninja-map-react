import React, { useState } from 'react';
import { generateMapGrid, createGridBounds } from '../lib/userApi';
import type { GridBounds, GridGenerationResponse } from '../lib/http';

interface GridGeneratorExampleProps {
  className?: string;
}

export function GridGeneratorExample({ className }: GridGeneratorExampleProps) {
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState<GridGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Example coordinates (Lagos, Nigeria area)
  const [southWest, setSouthWest] = useState({
    latitude: 6.453369435637782,
    longitude: 3.4163434352230695
  });
  
  const [northEast, setNorthEast] = useState({
    latitude: 6.453902478073502,
    longitude: 3.416584834043988
  });

  const handleGenerateGrid = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const bounds = createGridBounds(southWest, northEast);
      const result = await generateMapGrid(bounds);
      setGridData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate grid');
      console.error('Grid generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setGridData(null);
    setError(null);
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-6">Grid Generator Example</h2>
      
      {/* Input Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Coordinates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Southwest Corner</label>
            <div className="space-y-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={southWest.latitude}
                onChange={(e) => setSouthWest(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={southWest.longitude}
                onChange={(e) => setSouthWest(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Northeast Corner</label>
            <div className="space-y-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={northEast.latitude}
                onChange={(e) => setNorthEast(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={northEast.longitude}
                onChange={(e) => setNorthEast(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleGenerateGrid}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Grid'}
          </button>
          
          {(gridData || error) && (
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {gridData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Grid Generated Successfully!</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-green-600">{gridData.totalCells}</div>
              <div className="text-sm text-gray-600">Total Cells</div>
            </div>
            
            <div className="bg-white p-4 rounded-md">
              <div className="text-2xl font-bold text-blue-600">{gridData.totalAreaSquareMeters.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Square Meters</div>
            </div>
            
            <div className="bg-white p-4 rounded-md">
              <div className="text-lg font-bold text-purple-600">{gridData.gridDimensions}</div>
              <div className="text-sm text-gray-600">Grid Size</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md">
            <h4 className="font-semibold mb-3">Sample Grid Cells (First 5)</h4>
            <div className="space-y-2">
              {gridData.gridCells.slice(0, 5).map((cell) => (
                <div key={cell.cellId} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-mono text-sm">{cell.cellId}</span>
                    <span className="ml-2 text-gray-600">({cell.blockCode})</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {cell.center.latitude.toFixed(6)}, {cell.center.longitude.toFixed(6)}
                  </div>
                </div>
              ))}
              
              {gridData.gridCells.length > 5 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  ... and {gridData.gridCells.length - 5} more cells
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}