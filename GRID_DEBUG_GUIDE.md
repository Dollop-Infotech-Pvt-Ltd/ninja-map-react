# Grid API Debug Guide

## Fixed Issues ✅

1. **Corrected API Endpoint**: Changed from `/api/auth/generate` to `/api/auth/generatebody` as specified
2. **Added Detailed Logging**: Console logs now show API calls, responses, and errors
3. **Enhanced Error Handling**: Better error messages for common issues (network, timeout, 404, 500)
4. **Added Test Functions**: Browser console functions for easy testing

## How to Test the Grid API

### Method 1: Using the Map Interface
1. Start your development server: `npm run dev`
2. Navigate to the Map page
3. Click "Show Grid" button (top-right corner)
4. Click "Generate Grid" button
5. Check browser console for detailed logs

### Method 2: Browser Console Testing
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run one of these commands:
   ```javascript
   // Simple test
   testGridGeneration()
   
   // Detailed test
   testGridApi()
   ```

## Expected Console Output

### Successful API Call:
```
🔄 Calling grid generation API: http://192.168.1.78:8080/api/auth/generatebody
📍 Grid bounds: { leftBottom: {...}, rightTop: {...} }
✅ Grid generation successful: { gridCells: [...], totalCells: 25 }
```

### Common Error Messages:

#### Network Error:
```
❌ Grid generation failed: Network Error
📊 Error details: { status: undefined, message: "Network Error", url: "..." }
```
**Solution**: Check if the grid API server is running at `192.168.1.78:8080`

#### 404 Not Found:
```
❌ Grid generation failed: Request failed with status code 404
📊 Error details: { status: 404, message: "Not Found", url: "..." }
```
**Solution**: Verify the API endpoint `/api/auth/generatebody` exists on the server

#### Timeout:
```
❌ Grid generation failed: timeout of 30000ms exceeded
```
**Solution**: Grid generation is taking too long, check server performance

## Troubleshooting Steps

1. **Check Server Status**:
   - Ensure grid API server is running at `192.168.1.78:8080`
   - Test with curl: `curl -X POST http://192.168.1.78:8080/api/auth/generatebody`

2. **Check Network Connectivity**:
   - Can you access `http://192.168.1.78:8080` in browser?
   - Are there any firewall/network restrictions?

3. **Check CORS Settings**:
   - Grid API server must allow requests from your frontend domain
   - Check browser Network tab for CORS errors

4. **Verify Request Format**:
   - API expects JSON body with GridBounds structure
   - Check console logs for the exact request being sent

## API Request Format

The API expects this JSON structure:
```json
{
  "leftBottom": { "latitude": 6.453369, "longitude": 3.416343 },
  "leftTop": { "latitude": 6.453902, "longitude": 3.416343 },
  "rightTop": { "latitude": 6.453902, "longitude": 3.416585 },
  "rightBottom": { "latitude": 6.453369, "longitude": 3.416585 }
}
```

## Next Steps

1. Run the test functions in browser console
2. Check the detailed console logs
3. Verify the grid API server is accessible
4. Report any specific error messages you see