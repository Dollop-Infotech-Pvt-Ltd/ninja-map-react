import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Navigation, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { searchPlaces, type SearchResult } from '@/lib/mapSearchApi';

export default function AddPlace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeType = searchParams.get('type') || 'home'; // 'home' or 'work'
  
  const [showMap, setShowMap] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const title = placeType === 'home' ? 'Add Home' : 'Add Work';

  // Listen for messages from the map iframe
  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'MAP_CLICK' && event.data.location) {
        const { lat, lng, address } = event.data.location;
        setSelectedLocation({
          lat,
          lng,
          address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    };

    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  // Check if coordinates are within Nigeria bounds
  const isInNigeria = (lat: number, lng: number): boolean => {
    const nigeriaBounds = {
      north: 13.9,
      south: 4.3,
      west: 2.7,
      east: 14.7
    };
    
    return lat >= nigeriaBounds.south && 
           lat <= nigeriaBounds.north && 
           lng >= nigeriaBounds.west && 
           lng <= nigeriaBounds.east;
  };

  const handleLiveLocation = () => {
    setIsGettingLocation(true);
    
    const lagosDefault = {
      lat: 6.5244,
      lng: 3.3792,
      address: 'Lagos, Nigeria'
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (isInNigeria(latitude, longitude)) {
            setSelectedLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          } else {
            setSelectedLocation(lagosDefault);
          }
          
          setIsGettingLocation(false);
          setShowMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSelectedLocation(lagosDefault);
          setIsGettingLocation(false);
          setShowMap(true);
        },
        {
          timeout: 5000,
          enableHighAccuracy: true
        }
      );
    } else {
      setSelectedLocation(lagosDefault);
      setIsGettingLocation(false);
      setShowMap(true);
    }
  };

  const handleChooseOnMap = () => {
    const lagosDefault = {
      lat: 6.5244,
      lng: 3.3792,
      address: 'Lagos, Nigeria'
    };
    setSelectedLocation(lagosDefault);
    setShowMap(true);
  };

  const handleSave = () => {
    if (selectedLocation) {
      // Save the location to localStorage
      const storageKey = placeType === 'home' ? 'homeAddress' : 'workAddress';
      localStorage.setItem(storageKey, selectedLocation.address);
      
      console.log(`Saving ${placeType}:`, selectedLocation);
      alert(`${placeType === 'home' ? 'Home' : 'Work'} location saved!`);
      navigate('/my-places');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSelectedLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    });
    setShowSearch(false);
    setShowMap(true);
  };

  // Search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (showSearch) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-foreground">Search Address</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="container py-4 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter address, street, or place name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-[#036A38] hover:bg-[#025C31] text-white"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 container max-w-2xl pb-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#036A38]" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full panel-green p-4 hover:bg-muted/5 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#036A38] flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {result.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {result.display_name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Search for an address</p>
              <p className="text-sm text-muted-foreground mt-1">Enter a location name or address</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showMap) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMap(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-foreground">Choose on Map</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Map - Takes remaining space */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            src="/map"
            className="absolute inset-0 w-full h-full border-0"
            title="Location Map"
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Location Info Overlay */}
          {selectedLocation && (
            <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 p-4 space-y-3 z-10">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#036A38] flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{selectedLocation.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Move the marker to the exact location on the map
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#036A38] hover:bg-[#025C31] text-white"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-2xl">
        <div className="space-y-3">
          {/* Search Address */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-full panel-green p-4 hover:bg-muted/5 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-[#036A38]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-foreground">
                  Search {placeType === 'home' ? 'Home' : 'Work'} Address
                </h3>
              </div>
            </div>
          </button>

          {/* Live Location */}
          <button
            onClick={handleLiveLocation}
            disabled={isGettingLocation}
            className="w-full panel-green p-4 hover:bg-muted/5 transition-colors text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                <Navigation className={cn(
                  "h-6 w-6 text-[#036A38]",
                  isGettingLocation && "animate-spin"
                )} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-foreground">
                  {isGettingLocation ? 'Getting location...' : 'Live location'}
                </h3>
              </div>
            </div>
          </button>

          {/* Choose on Map */}
          <button
            onClick={handleChooseOnMap}
            className="w-full panel-green p-4 hover:bg-muted/5 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#036A38]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-foreground">Choose on map</h3>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
