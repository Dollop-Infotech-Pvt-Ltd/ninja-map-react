# Nigeria Location Detection Feature

## Overview

This feature detects whether users are accessing NINja Map from within Nigeria or from outside the country, and displays appropriate messages to inform them about service availability and limitations.

## Problem Statement

Since NINja Map is specifically designed for Nigerian navigation, users accessing the application from outside Nigeria (like Indore, MP, India) should be informed that:
- The service is optimized for Nigerian roads and locations
- Some features may be limited outside Nigeria
- Map data may be less comprehensive for non-Nigerian locations

## Implementation

### Core Components

#### 1. Location Utilities (`client/lib/locationUtils.ts`)
- **Nigeria Boundary Detection**: Checks if coordinates fall within Nigeria's geographic boundaries
- **Geolocation API Integration**: Uses browser's geolocation to get user's current position
- **Distance Calculation**: Calculates distance from Nigeria's center
- **Reverse Geocoding**: Gets location details using external API

```typescript
// Nigeria's boundaries
const NIGERIA_BOUNDS = {
  north: 13.9,    // Northern border (near Chad/Niger)
  south: 4.3,     // Southern border (Gulf of Guinea)
  west: 2.7,      // Western border (near Benin)
  east: 14.7      // Eastern border (near Cameroon)
};
```

#### 2. Location Alert Component (`client/components/LocationAlert.tsx`)
- **Animated Alert**: Smooth slide-in animation using Framer Motion
- **Smart Display**: Only shows for users outside Nigeria (configurable)
- **Dismissible**: Users can close the alert
- **Retry Functionality**: Allows users to retry location detection
- **Error Handling**: Graceful handling of geolocation errors

#### 3. Test Page (`client/pages/LocationTest.tsx`)
- **Interactive Testing**: Allows users to test location detection
- **Known Locations**: Tests predefined locations (Lagos, Indore, London, etc.)
- **Visual Results**: Shows distance from Nigeria and inside/outside status

### Integration Points

#### 1. Landing Page (`client/pages/Index.tsx`)
```typescript
{showLocationAlert && (
  <LocationAlert 
    onDismiss={() => setShowLocationAlert(false)}
    showOnlyOutsideNigeria={true}
  />
)}
```

#### 2. Map Page (`client/pages/Map.tsx`)
```typescript
{showLocationAlert && (
  <LocationAlert 
    onDismiss={() => setShowLocationAlert(false)}
    showOnlyOutsideNigeria={true}
  />
)}
```

## User Experience

### For Users Inside Nigeria
- **No Alert**: Users inside Nigeria don't see any location warnings
- **Full Functionality**: All features work as expected
- **Welcome Message**: If alert is shown, displays positive welcome message

### For Users Outside Nigeria
- **Location Alert**: Prominent alert at top of page
- **Clear Messaging**: Explains service limitations outside Nigeria
- **Helpful Information**: Lists what features may be limited
- **Dismissible**: Can be closed by user

### Example Messages

#### Inside Nigeria (Abuja, Lagos, Kano):
```
✅ Welcome! You are in Nigeria and can access all NINja Map features.
```

#### Outside Nigeria (Indore, MP, India):
```
🌍 You are currently outside Nigeria (in Indore, Madhya Pradesh, India). 
NINja Map is optimized for Nigerian navigation. Some features may be 
limited in your current location.

• Map data may be limited outside Nigeria
• Navigation optimized for Nigerian roads  
• Some features require Nigerian location
```

## Technical Details

### Geolocation API Usage
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Success: Got user coordinates
    const { latitude, longitude } = position.coords;
    checkIfInNigeria(latitude, longitude);
  },
  (error) => {
    // Handle errors: permission denied, unavailable, timeout
    handleLocationError(error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes cache
  }
);
```

### Boundary Checking Algorithm
```typescript
function isLocationInNigeria(lat: number, lng: number): boolean {
  return (
    lat >= NIGERIA_BOUNDS.south &&
    lat <= NIGERIA_BOUNDS.north &&
    lng >= NIGERIA_BOUNDS.west &&
    lng <= NIGERIA_BOUNDS.east
  );
}
```

### Distance Calculation (Haversine Formula)
```typescript
function getDistanceFromNigeria(lat: number, lng: number): number {
  const nigeriaCenterLat = 9.0765; // Abuja coordinates
  const nigeriaCenterLng = 7.3986;
  
  // Haversine formula implementation
  const R = 6371; // Earth's radius in kilometers
  // ... calculation
  return distance;
}
```

## Testing

### Manual Testing
1. **Visit Test Page**: Navigate to `/location-test`
2. **Check Current Location**: Click "Check My Location" button
3. **Test Known Locations**: Click "Test All Locations" to see predefined results

### Known Test Locations
- **Inside Nigeria**: Lagos, Abuja, Kano
- **Outside Nigeria**: Indore (India), London (UK), New York (USA)

### Browser Console Testing
```javascript
// Test specific coordinates
import { isLocationInNigeria } from './client/lib/locationUtils';

// Test Indore, MP, India
console.log(isLocationInNigeria(22.7196, 75.8577)); // false

// Test Lagos, Nigeria  
console.log(isLocationInNigeria(6.5244, 3.3792)); // true
```

## Error Handling

### Geolocation Errors
- **Permission Denied**: User blocked location access
- **Position Unavailable**: GPS/network issues
- **Timeout**: Location request took too long

### Fallback Behavior
- **No Location**: Shows generic message about Nigeria optimization
- **Network Error**: Graceful degradation with retry option
- **API Failure**: Falls back to coordinate display

## Privacy Considerations

### Data Usage
- **No Storage**: Location data is not stored or transmitted to servers
- **Client-Side Only**: All processing happens in the browser
- **No Tracking**: No user location tracking or analytics

### User Control
- **Permission Required**: Requires explicit user permission for geolocation
- **Dismissible**: Users can close alerts and opt out
- **No Forced Detection**: Works without location if user denies permission

## Configuration Options

### Alert Behavior
```typescript
<LocationAlert 
  onDismiss={() => setShowLocationAlert(false)}
  showOnlyOutsideNigeria={true}  // Only show for non-Nigerian users
/>
```

### Boundary Adjustment
```typescript
// Can be adjusted for different regions or accuracy
const NIGERIA_BOUNDS = {
  north: 13.9,  // Adjustable northern boundary
  south: 4.3,   // Adjustable southern boundary
  west: 2.7,    // Adjustable western boundary
  east: 14.7    // Adjustable eastern boundary
};
```

## Future Enhancements

### Planned Features
1. **IP-Based Detection**: Fallback to IP geolocation if GPS unavailable
2. **Regional Messaging**: Different messages for different regions
3. **Feature Restrictions**: Actually limit features based on location
4. **Analytics**: Track usage patterns (with user consent)

### Possible Improvements
1. **More Accurate Boundaries**: Use precise Nigerian border coordinates
2. **State-Level Detection**: Detect specific Nigerian states
3. **Language Localization**: Messages in local languages
4. **Offline Detection**: Work without internet connection

## Routes

- **Main App**: `/` and `/map` - Shows location alert
- **Test Page**: `/location-test` - Interactive testing interface
- **All Pages**: Can be integrated into any page as needed

## Dependencies

### New Dependencies
- No additional npm packages required
- Uses built-in browser APIs

### External APIs (Optional)
- **BigDataCloud**: For detailed reverse geocoding
- **Fallback**: Works without external APIs

## Browser Support

### Geolocation API Support
- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Full support on modern browsers

### Fallback for Unsupported Browsers
- Shows generic message about Nigeria optimization
- No location-specific features break