# Dynamic Grid API Payload Setup ✅

## 🎯 Configuration Updated:
- **API Endpoint**: `http://192.168.1.78:7002/api/grid/polylines-with-codes`
- **Payload Structure**: Dynamic coordinates based on current map bounds
- **Example Payload**:
```json
{
  "leftBottomLat": 6.462356930368416,
  "leftBottomLon": 3.417403805123172,
  "leftTopLat": 6.464158730368416,
  "leftTopLon": 3.417403805123172,
  "rightTopLat": 6.464158730368416,
  "rightTopLon": 3.419217005123172,
  "rightBottomLat": 6.462356930368416,
  "rightBottomLon": 3.419217005123172
}
```

## 🔄 How Dynamic Payload Works:

1. **User pans/zooms map** to desired area
2. **Clicks "Generate Grid"** button
3. **System captures current map bounds**:
   - Southwest corner (bottom-left)
   - Northeast corner (top-right)
4. **Creates dynamic payload**:
   - `leftBottomLat/Lon`: Southwest coordinates
   - `leftTopLat/Lon`: Northwest coordinates (SW lat + NE lat, SW lon)
   - `rightTopLat/Lon`: Northeast coordinates
   - `rightBottomLat/Lon`: Southeast coordinates (SW lat, NE lon)

## 🧪 Test Functions Available:

### In Browser Console:
```javascript
// Test payload structure generation
testPayloadStructure()

// Test direct API call with exact coordinates
testDirectAPI()

// Test full React component flow
testGridGeneration()

// Show current configuration
testEndpoint()
```

## 🔍 Expected Console Output:

When you click "Generate Grid":
```
🚀 Generate Grid button clicked!
📍 Map object: Map {...}
🗺️ Current map bounds: { sw: {...}, ne: {...} }
📍 Generated grid bounds: {...}
📋 Dynamic payload structure: {
  "leftBottomLat": 6.462356930368416,
  "leftBottomLon": 3.417403805123172,
  "leftTopLat": 6.464158730368416,
  "leftTopLon": 3.417403805123172,
  "rightTopLat": 6.464158730368416,
  "rightTopLon": 3.419217005123172,
  "rightBottomLat": 6.462356930368416,
  "rightBottomLon": 3.419217005123172
}
🔄 generateMapGrid called with bounds: {...}
🔄 Calling grid generation API: http://192.168.1.78:7002/api/grid/polylines-with-codes
```

## ✅ Ready to Test:

1. **Restart dev server**: `npm run dev`
2. **Hard refresh browser**: `Ctrl+Shift+R`
3. **Test payload structure**: Run `testPayloadStructure()` in console
4. **Test API call**: Run `testDirectAPI()` in console
5. **Test UI**: Go to Map → Show Grid → Generate Grid

The system now dynamically generates the exact payload structure you specified based on the current map view!