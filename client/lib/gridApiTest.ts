import { generateMapGrid, createGridBounds } from './userApi';

/**
 * Simple test function to verify the grid API works
 */
export async function testGridApi() {
  try {
    console.log('🧪 Testing Grid API with static data...');
    
    // Using static data for now (will be dynamic later)
    console.log('📍 Using static coordinates for testing');
    const bounds = createGridBounds(
      { latitude: 6.462356930368416, longitude: 3.417403805123172 }, // Southwest (leftBottom)
      { latitude: 6.464158730368416, longitude: 3.419217005123172 }  // Northeast (rightTop)
    );
    
    console.log('📍 Test bounds:', bounds);
    
    // Call the API
    const result = await generateMapGrid(bounds);
    
    console.log('✅ Grid API test successful!');
    console.log('📊 API Response:', result);
    
    // Handle different response structures
    if (result.totalCells) {
      console.log(`� Generated ${result.totalCells} cells`);
    }
    if (result.gridDimensions) {
      console.log(`� Grid dimensions: ${result.gridDimensions}`);
    }
    if (result.totalAreaSquareMeters) {
      console.log(`📐 Total area: ${result.totalAreaSquareMeters.toFixed(2)} sq meters`);
    }
    
    // Log sample data if available
    if (result.gridCells && result.gridCells.length > 0) {
      console.log('🔍 Sample cells:');
      result.gridCells.slice(0, 3).forEach(cell => {
        console.log(`  - ${cell.cellId}: ${cell.blockCode} at (${cell.center.latitude.toFixed(6)}, ${cell.center.longitude.toFixed(6)})`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Grid API test failed:', error);
    throw error;
  }
}

// Export for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testGridApi = testGridApi;
  (window as any).testGridGeneration = async () => {
    console.log('🧪 Testing grid generation with simple bounds...');
    try {
      const result = await testGridApi();
      console.log('✅ Test completed successfully!');
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  };
  
  // Add a simple endpoint test
  (window as any).testEndpoint = () => {
    console.log('🔍 Current grid API endpoint configuration:');
    console.log('Base URL: https://api.ninja-map.dollopinfotech.com');
    console.log('Full endpoint: https://api.ninja-map.dollopinfotech.com/api/grid/polylines-with-codes');
    console.log('Expected in network tab: POST to /api/grid/polylines-with-codes');
  };
  
      // Add direct API test using fetch
  (window as any).testDirectAPI = async () => {
    console.log('🧪 Testing direct API call with static data...');
    try {
      const staticPayload = {
        leftBottomLat: 6.462807379918416,
        leftBottomLon: 3.417857105123172,
        leftTopLat: 6.463708280818416,
        leftTopLon: 3.417857105123172,
        rightTopLat: 6.463708280818416,
        rightTopLon: 3.418763705123172,
        rightBottomLat: 6.462807379918416,
        rightBottomLon: 3.418763705123172
      };
      
      console.log('📡 Sending request to:', 'https://api.ninja-map.dollopinfotech.com/api/grid/polylines-with-codes');
      console.log('📡 Static payload:', staticPayload);
      
      const response = await fetch('https://api.ninja-map.dollopinfotech.com/api/grid/polylines-with-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(staticPayload)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Direct API test successful:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Direct API test failed:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Direct API test error:', error);
      return null;
    }
  };
  
  // Add payload structure verification
  (window as any).testPayloadStructure = () => {
    console.log('🔍 Testing static payload structure...');
    const staticPayload = {
      leftBottomLat: 6.462807379918416,
      leftBottomLon: 3.417857105123172,
      leftTopLat: 6.463708280818416,
      leftTopLon: 3.417857105123172,
      rightTopLat: 6.463708280818416,
      rightTopLon: 3.418763705123172,
      rightBottomLat: 6.462807379918416,
      rightBottomLon: 3.418763705123172
    };
    
    console.log('📋 Static payload being used:', staticPayload);
    console.log('✅ Using static data for testing (will be dynamic later)');
    
    // Verify structure matches exactly
    const expectedKeys = ['leftBottomLat', 'leftBottomLon', 'leftTopLat', 'leftTopLon', 'rightTopLat', 'rightTopLon', 'rightBottomLat', 'rightBottomLon'];
    const actualKeys = Object.keys(staticPayload);
    const matches = expectedKeys.every(key => actualKeys.includes(key)) && actualKeys.length === expectedKeys.length;
    
    console.log('🔍 Structure validation:', matches ? '✅ PASS' : '❌ FAIL');
    return staticPayload;
  };
  
  console.log('🔧 Grid API test functions available:');
  console.log('  - window.testGridApi()');
  console.log('  - window.testGridGeneration()');
  console.log('  - window.testEndpoint()');
  console.log('  - window.testDirectAPI() - Direct fetch test');
  console.log('  - window.testPayloadStructure() - Verify payload format');
}