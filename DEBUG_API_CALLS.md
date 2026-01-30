# Debug Grid API Calls - Updated API

## 🔧 Updated Configuration:
- **API Endpoint**: `http://192.168.1.78:7002/api/grid/polylines-with-codes`
- **Method**: POST
- **Payload Structure**: Flat coordinate structure (leftBottomLat, leftBottomLon, etc.)

## 🧪 Testing Steps:

### Step 1: Restart and Clear Cache
```bash
# Stop dev server (Ctrl+C)
npm run dev
```
- Hard refresh browser: `Ctrl+Shift+R`
- Open DevTools → Console tab

### Step 2: Test Direct API Call
In browser console, run:
```javascript
testDirectAPI()
```
This will call: `http://192.168.1.78:7002/api/grid/polylines-with-codes`

### Step 3: Test Through React Components
1. Go to Map page
2. Click "Show Grid" button
3. Click "Generate Grid" button
4. Watch console for these logs:
   ```
   🚀 Generate Grid button clicked!
   🔄 Calling grid generation API: http://192.168.1.78:7002/api/grid/polylines-with-codes
   🔧 API Version: v3.0 - Updated endpoint and payload
   ```

## 🔍 Expected Payload Format:
```json
{
  "leftBottomLat": 6.524148127451659,
  "leftBottomLon": 3.379851722199226,
  "leftTopLat": 6.524673950048415,
  "leftTopLon": 3.379851722199226,
  "rightTopLat": 6.524673950048415,
  "rightTopLon": 3.379293121018695,
  "rightBottomLat": 6.524148127451659,
  "rightBottomLon": 3.379293121018695
}
```

## 🔍 Expected Console Output:

### If Everything Works:
```
🚀 Generate Grid button clicked!
📍 Map object: Map {...}
🔄 generateMapGrid called with bounds: {leftBottomLat: ..., leftBottomLon: ...}
🔄 Calling grid generation API: http://192.168.1.78:7002/api/grid/polylines-with-codes
🕐 Timestamp: 2026-01-27T...
🔧 API Version: v3.0 - Updated endpoint and payload
✅ Grid generation successful: {...}
```

## 🔧 Available Test Functions:
- `testDirectAPI()` - Direct fetch test with new endpoint
- `testGridGeneration()` - Full React component test
- `testEndpoint()` - Show current configuration

## 📋 Updated Troubleshooting:
- [ ] Grid API server running at **192.168.1.78:7002** (new port)
- [ ] Can access http://192.168.1.78:7002 in browser
- [ ] Endpoint `/api/grid/polylines-with-codes` exists
- [ ] CORS enabled on grid API server
- [ ] Network tab shows correct payload structure