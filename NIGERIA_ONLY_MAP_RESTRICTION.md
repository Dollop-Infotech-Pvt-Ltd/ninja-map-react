# Nigeria-Only Map Restriction Feature

## Overview

The NINja Map application has been configured to show **ONLY Nigeria** on the map. Users cannot view, navigate to, or interact with any other countries. This ensures the application stays focused on its core purpose: Nigerian navigation.

## 🚫 **What's Restricted**

### **Map Boundaries**
- **View Bounds**: Map is locked to Nigeria's geographic boundaries
- **Pan Restriction**: Users cannot pan outside Nigeria
- **Zoom Limits**: Minimum zoom level prevents viewing other countries
- **Max Bounds**: MapLibre maxBounds property restricts viewport

### **User Location**
- **Outside Nigeria**: If user's GPS location is outside Nigeria, it gets redirected to nearest Nigerian city
- **Location Services**: Only works within Nigeria boundaries
- **Fallback Cities**: Abuja, Lagos, Kano, etc. used as fallback locations

### **Search Results**
- **Nigeria-Only Results**: Search API filters out all non-Nigerian locations
- **Coordinate Filtering**: Results outside Nigeria boundaries are excluded
- **Reverse Geocoding**: Only works for coordinates within Nigeria

### **Map Interactions**
- **Click Events**: Clicks outside Nigeria get redirected to nearest Nigerian location
- **Route Planning**: All routing restricted to Nigerian coordinates
- **Markers**: Cannot place markers outside Nigeria

## 🇳🇬 **Nigeria Boundaries**

```typescript
const NIGERIA_MAP_BOUNDS = {
  north: 13.9,    // Northern border (near Chad/Niger)
  south: 4.3,     // Southern border (Gulf of Guinea)  
  west: 2.7,      // Western border (near Benin)
  east: 14.7      // Eastern border (near Cameroon)
};
```

## 🏙️ **Fallback Cities**

When user location is outside Nigeria, they're redirected to the nearest Nigerian city:

- **Abuja** (Capital) - 9.0765°N, 7.3986°E
- **Lagos** (Commercial) - 6.5244°N, 3.3792°E  
- **Kano** (Northern) - 12.0022°N, 8.5920°E
- **Ibadan** (Southwest) - 7.3775°N, 3.9470°E
- **Benin City** (South) - 6.3350°N, 5.6037°E
- **Jos** (Central) - 9.8965°N, 8.8583°E
- **Kaduna** (Northwest) - 10.5222°N, 7.4383°E
- **Maiduguri** (Northeast) - 11.8311°N, 13.1510°E
- **Zaria** (North) - 11.0804°N, 7.7076°E
- **Aba** (Southeast) - 5.1066°N, 7.3667°E

## 🔧 **Implementation Details**

### **Map Configuration**
```typescript
map.current = new maplibregl.Map({
  container: mapContainer.current,
  style: initialStyle,
  center: [NIGERIA_CENTER.longitude, NIGERIA_CENTER.latitude], // Abuja
  zoom: NIGERIA_CENTER.zoom,
  maxZoom: 18, // Restrict max zoom for Nigeria
  minZoom: 5,  // Restrict min zoom to keep focus on Nigeria
  // Restrict map bounds to Nigeria only
  maxBounds: getNigeriaMapBounds(),
});
```

### **Location Validation**
```typescript
function validateLocationForNigeria(lat: number, lng: number) {
  if (isWithinNigeria(lat, lng)) {
    return {
      isValid: true,
      correctedLat: lat,
      correctedLng: lng,
      message: 'Location is within Nigeria'
    };
  }
  
  // Redirect to nearest Nigerian city
  const nearestCity = getNearestNigerianCity(lat, lng);
  return {
    isValid: false,
    correctedLat: nearestCity.lat,
    correctedLng: nearestCity.lng,
    message: `Location outside Nigeria. Redirected to ${nearestCity.name}, Nigeria.`
  };
}
```

### **Search Filtering**
```typescript
// Filter search results to Nigeria only
const transformedResults = data.results.places
  .filter((place) => {
    const lat = place.coordinates.latitude;
    const lng = place.coordinates.longitude;
    return isWithinNigeria(lat, lng); // Only Nigerian locations
  })
  .map((place) => ({
    // Transform to SearchResult format
  }));
```

## 📱 **User Experience**

### **For Users in Nigeria**
- ✅ **Full Access**: Complete map functionality
- ✅ **Accurate Location**: GPS location works normally
- ✅ **Local Search**: All Nigerian places searchable
- ✅ **Navigation**: Full routing within Nigeria

### **For Users Outside Nigeria (e.g., Indore, India)**
- 🔄 **Location Redirect**: GPS redirected to nearest Nigerian city
- 🇳🇬 **Nigeria View**: Map shows Nigeria only
- 🔍 **Filtered Search**: Only Nigerian results in search
- 📍 **Restricted Clicks**: Map clicks redirect to Nigerian locations
- 💬 **Toast Messages**: Informed about location restrictions

### **Example User Messages**
```
🌍 "Your location is outside Nigeria. Showing nearest Nigerian city instead."
🇳🇬 "Location outside Nigeria. Redirected to Lagos, Nigeria."
🔍 "Search results filtered to show Nigerian locations only."
```

## 🛠️ **Technical Components**

### **New Files Created**
1. **`client/lib/nigeriaMapBounds.ts`** - Nigeria boundary logic
2. **`NIGERIA_ONLY_MAP_RESTRICTION.md`** - This documentation

### **Modified Files**
1. **`client/pages/Map.tsx`** - Map initialization and restrictions
2. **`client/lib/mapSearchApi.ts`** - Search result filtering

### **Key Functions**
- `isWithinNigeria(lat, lng)` - Check if coordinates are in Nigeria
- `clampToNigeria(lat, lng)` - Force coordinates to Nigeria boundaries
- `getNearestNigerianCity(lat, lng)` - Find closest Nigerian city
- `validateLocationForNigeria(lat, lng)` - Validate and correct location
- `getNigeriaMapBounds()` - Get MapLibre bounds for Nigeria

## 🧪 **Testing the Restriction**

### **Test Scenarios**

#### **1. User Location Outside Nigeria**
- **Input**: GPS location in Indore, India (22.7196°N, 75.8577°E)
- **Expected**: Redirected to nearest Nigerian city (likely Abuja)
- **Message**: "Your location is outside Nigeria. Showing nearest Nigerian city instead."

#### **2. Search for Non-Nigerian Places**
- **Input**: Search for "London", "New York", "Mumbai"
- **Expected**: No results or only Nigerian places with similar names
- **Behavior**: Search API filters out non-Nigerian coordinates

#### **3. Map Click Outside Nigeria**
- **Input**: Click on map area outside Nigeria (if somehow visible)
- **Expected**: Click redirected to nearest Nigerian location
- **Behavior**: Coordinates corrected to Nigerian boundaries

#### **4. Pan/Zoom Restrictions**
- **Input**: Try to pan outside Nigeria or zoom out too far
- **Expected**: Map stays within Nigeria bounds
- **Behavior**: MapLibre maxBounds prevents leaving Nigeria

### **Testing Commands**
```bash
# Start development server
npm run dev

# Test in browser console
isWithinNigeria(22.7196, 75.8577); // false (Indore, India)
isWithinNigeria(6.5244, 3.3792);   // true (Lagos, Nigeria)

# Test location validation
validateLocationForNigeria(22.7196, 75.8577); 
// Returns: { isValid: false, correctedLat: 9.0765, correctedLng: 7.3986, message: "..." }
```

## 🔒 **Security & Privacy**

### **Data Handling**
- **No External Tracking**: Location restrictions happen client-side
- **No Data Storage**: Corrected locations not stored permanently
- **Privacy Preserved**: Original GPS coordinates not transmitted
- **Local Processing**: All boundary checking done in browser

### **Fallback Behavior**
- **Graceful Degradation**: Works even if GPS fails
- **Error Handling**: Handles network failures gracefully
- **User Control**: Users can still interact with Nigerian locations
- **No Breaking Changes**: Existing functionality preserved within Nigeria

## 🚀 **Benefits**

### **For Nigerian Users**
- **Focused Experience**: No distractions from other countries
- **Faster Performance**: Smaller map area loads faster
- **Relevant Results**: All search results are Nigerian
- **Local Optimization**: Features optimized for Nigerian use cases

### **For International Users**
- **Clear Boundaries**: Understand the app is Nigeria-focused
- **Guided Experience**: Automatically shown Nigerian locations
- **Educational**: Learn about Nigerian geography
- **No Confusion**: Clear messaging about restrictions

## 🔄 **Future Enhancements**

### **Possible Improvements**
1. **Regional Restrictions**: Allow specific Nigerian states only
2. **Configurable Bounds**: Admin panel to adjust boundaries
3. **Exception Handling**: Allow certain international locations (airports, etc.)
4. **Analytics**: Track restriction events (with user consent)
5. **Custom Messages**: Different messages for different regions

### **Advanced Features**
1. **Border Visualization**: Show Nigeria borders on map
2. **State Boundaries**: Highlight Nigerian state boundaries
3. **Capital Highlighting**: Emphasize major Nigerian cities
4. **Cultural Markers**: Show Nigerian cultural landmarks

## 📊 **Performance Impact**

### **Positive Impacts**
- **Faster Loading**: Smaller map area loads quicker
- **Reduced Bandwidth**: Less tile data downloaded
- **Better Performance**: Fewer API calls for non-Nigerian data
- **Focused Caching**: Cache only Nigerian map data

### **Minimal Overhead**
- **Boundary Checks**: Very fast coordinate comparisons
- **Client-Side**: No additional server requests
- **Efficient Filtering**: Minimal impact on search performance
- **Memory Usage**: No significant memory increase

## 🌍 **Global Accessibility**

While the map is Nigeria-only, the application remains accessible to international users:

- **Educational Value**: Learn about Nigerian geography
- **Planning Tool**: Plan trips to Nigeria from abroad
- **Cultural Exploration**: Explore Nigerian cities and landmarks
- **Business Use**: International businesses operating in Nigeria

The restriction enhances rather than limits the user experience by providing a focused, optimized Nigerian navigation solution.