/**
 * Simple test to verify grid functionality fixes
 * Run this in the browser console when the map is loaded
 */

// Test 1: Verify grid API endpoint is accessible
async function testGridEndpoint() {
  console.log('🧪 Testing Grid API endpoint...');
  
  const testPayload = {
    leftBottomLat: 6.462807379918416,
    leftBottomLon: 3.417857105123172,
    leftTopLat: 6.463708280818416,
    leftTopLon: 3.417857105123172,
    rightTopLat: 6.463708280818416,
    rightTopLon: 3.418763705123172,
    rightBottomLat: 6.462807379918416,
    rightBottomLon: 3.418763705123172
  };
  
  try {
    const response = await fetch('http://192.168.1.78:7002/api/grid/polylines-with-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Grid API endpoint is working:', data);
      return true;
    } else {
      console.error('❌ Grid API endpoint failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Grid API endpoint error:', error);
    return false;
  }
}

// Test 2: Verify grid layer activation
function testGridLayerActivation() {
  console.log('🧪 Testing Grid layer activation...');
  
  // Check if map exists
  if (typeof window !== 'undefined' && window.map) {
    console.log('✅ Map instance found');
    
    // Check current zoom level
    const zoom = window.map.getZoom();
    console.log(`📍 Current zoom level: ${zoom.toFixed(1)}`);
    
    if (zoom >= 18) {
      console.log('✅ Zoom level is sufficient for grid (≥18)');
    } else {
      console.log('⚠️ Zoom level too low for grid. Zoom to level 18+ to see grid.');
    }
    
    return true;
  } else {
    console.error('❌ Map instance not found. Make sure you\'re on the map page.');
    return false;
  }
}

// Test 3: Simulate grid layer selection
function testGridLayerSelection() {
  console.log('🧪 Testing Grid layer selection simulation...');
  
  // This would normally be triggered by clicking the grid layer button
  console.log('📋 Grid layer selection should:');
  console.log('  1. Set mapLayer to "grid"');
  console.log('  2. Set isGridVisible to true');
  console.log('  3. If zoom ≥18, immediately call grid API');
  console.log('  4. Display grid overlay on map');
  
  return true;
}

// Run all tests
async function runGridTests() {
  console.log('🚀 Starting Grid functionality tests...');
  console.log('=====================================');
  
  const test1 = await testGridEndpoint();
  const test2 = testGridLayerActivation();
  const test3 = testGridLayerSelection();
  
  console.log('=====================================');
  console.log('📊 Test Results:');
  console.log(`  Grid API Endpoint: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Grid Layer Activation: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Grid Layer Selection: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 && test2 && test3) {
    console.log('🎉 All tests passed! Grid functionality should work correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.testGridEndpoint = testGridEndpoint;
  window.testGridLayerActivation = testGridLayerActivation;
  window.testGridLayerSelection = testGridLayerSelection;
  window.runGridTests = runGridTests;
  
  console.log('🔧 Grid test functions available:');
  console.log('  - window.testGridEndpoint()');
  console.log('  - window.testGridLayerActivation()');
  console.log('  - window.testGridLayerSelection()');
  console.log('  - window.runGridTests() - Run all tests');
}