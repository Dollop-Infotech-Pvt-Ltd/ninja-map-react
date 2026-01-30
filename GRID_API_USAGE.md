# Grid Generation API Usage

This document explains how to use the grid generation API integration in your React application.

## 🚀 Quick Start

### Basic Usage

```typescript
import { generateMapGrid, createGridBounds } from './client/lib/userApi';

// Method 1: Create bounds using helper function
const bounds = createGridBounds(
  { latitude: 6.453369435637782, longitude: 3.4163434352230695 }, // Southwest
  { latitude: 6.453902478073502, longitude: 3.416584834043988 }    // Northeast
);

// Generate grid
const gridData = await generateMapGrid(bounds);
console.log(`Generated ${gridData.totalCells} cells`);
```

### React Component Usage

```typescript
import React, { useState } from 'react';
import { generateMapGrid, createGridBounds } from '../lib/userApi';
import type { GridGenerationResponse } from '../lib/http';

function MyMapComponent() {
  const [gridData, setGridData] = useState<GridGenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateGrid = async () => {
    setLoading(true);
    try {
      const bounds = createGridBounds(
        { latitude: 6.453369, longitude: 3.416343 },
        { latitude: 6.453902, longitude: 3.416585 }
      );
      const result = await generateMapGrid(bounds);
      setGridData(result);
    } catch (error) {
      console.error('Grid generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateGrid} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Grid'}
      </button>
      
      {gridData && (
        <div>
          <h3>Grid Generated!</h3>
          <p>Total cells: {gridData.totalCells}</p>
          <p>Area: {gridData.totalAreaSquareMeters.toFixed(2)} sq meters</p>
        </div>
      )}
    </div>
  );
}
```

## 📋 API Reference

### Functions

#### `generateMapGrid(bounds: GridBounds): Promise<GridGenerationResponse>`

Generates a grid for the specified geographic bounds.

**Parameters:**
- `bounds`: GridBounds object defining the area

**Returns:**
- Promise resolving to GridGenerationResponse with grid data

#### `createGridBounds(southWest, northEast): GridBounds`

Helper function to create GridBounds from two corner coordinates.

**Parameters:**
- `southWest`: `{ latitude: number, longitude: number }` - Bottom-left corner
- `northEast`: `{ latitude: number, longitude: number }` - Top-right corner

**Returns:**
- GridBounds object ready for API call

### Types

#### `GridBounds`
```typescript
interface GridBounds {
  leftBottom: { latitude: number; longitude: number };
  leftTop: { latitude: number; longitude: number };
  rightTop: { latitude: number; longitude: number };
  rightBottom: { latitude: number; longitude: number };
}
```

#### `GridGenerationResponse`
```typescript
interface GridGenerationResponse {
  gridCells: GridCell[];
  totalRows: number;
  totalColumns: number;
  totalHeightMeters: number;
  totalWidthMeters: number;
  gridDimensions: string;
  totalCells: number;
  summary: string;
  totalAreaSquareMeters: number;
}
```

#### `GridCell`
```typescript
interface GridCell {
  row: number;
  col: number;
  bottomLeft: { latitude: number; longitude: number };
  bottomRight: { latitude: number; longitude: number };
  topLeft: { latitude: number; longitude: number };
  topRight: { latitude: number; longitude: number };
  polyline: Array<{ latitude: number; longitude: number }>;
  center: { latitude: number; longitude: number };
  blockCode: string;
  cellId: string;
  areaSquareMeters: number;
  polylineAsArray: number[][];
}
```

## 🧪 Testing

### Browser Console Test

The project includes a test function you can run in the browser console:

```javascript
// This function is automatically available in development
window.testGridApi();
```

### Manual Testing

```typescript
import { testGridApi } from './client/lib/gridApiTest';

// Run the test
testGridApi()
  .then(result => console.log('Test passed:', result))
  .catch(error => console.error('Test failed:', error));
```

## 🎯 Example Component

A complete example component is available at:
`client/components/GridGeneratorExample.tsx`

This component demonstrates:
- Input fields for coordinates
- Loading states
- Error handling
- Results display
- Grid cell visualization

## 🔧 Configuration

### API Endpoint

The API calls `http://192.168.1.78:8080/api/auth/generatebody` by default.

To use a different endpoint:

```typescript
import { generateGrid } from './client/lib/http';

// Custom endpoint
const result = await generateGrid(bounds, 'http://your-api-server:port');
```

### Error Handling

The API includes comprehensive error handling:

```typescript
try {
  const result = await generateMapGrid(bounds);
  // Success
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    status: error.status,
    data: error.data
  });
}
```

## 📊 Response Example

The API returns a response like this:

```json
{
  "gridCells": [
    {
      "row": 0,
      "col": 0,
      "cellId": "R0C0",
      "blockCode": "LAEKY-S14-KTWZ-9WV",
      "center": {
        "latitude": 6.453383432250956,
        "longitude": 3.4163575168209563
      },
      "areaSquareMeters": 9.0,
      // ... more cell properties
    }
    // ... more cells
  ],
  "totalCells": 180,
  "totalRows": 20,
  "totalColumns": 9,
  "gridDimensions": "20 rows × 9 columns = 180 cells",
  "totalAreaSquareMeters": 1580.906848674093,
  "summary": "Generated 180 grid cells (3m × 3m each) covering 26.67 m × 59.27 m (1580.91 sq meters total)"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Network Error**: Ensure the API server at `192.168.1.78:8080` is running and accessible
2. **CORS Issues**: The API server needs to allow requests from your domain
3. **Invalid Coordinates**: Ensure latitude/longitude values are valid numbers
4. **Timeout**: Large areas may take longer to process (30s timeout configured)

### Debug Mode

Enable debug logging:

```typescript
// The API functions include console.log statements for debugging
// Check browser console for detailed request/response information
```