import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Plane, ShoppingBag, Home as HomeIcon, Building, Dumbbell, Landmark, Edit2, Share2, Trash2, Route as RouteIcon, Pin } from 'lucide-react';

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  icon: string;
  lat: number;
  lng: number;
}

interface SavedRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distance?: string;
}

interface DroppedPin {
  id: string;
  lat: number;
  lng: number;
  address: string;
  timestamp: number;
}

const iconMap: Record<string, any> = {
  plane: Plane,
  shopping: ShoppingBag,
  home: HomeIcon,
  building: Building,
  gym: Dumbbell,
  landmark: Landmark,
};

type PageType = 'places' | 'routes' | 'pins';

export default function SavedPlaces() {
  const navigate = useNavigate();
  const location = useLocation();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [pins, setPins] = useState<DroppedPin[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Determine page type from URL
  const pageType: PageType = location.pathname.includes('routes') 
    ? 'routes' 
    : location.pathname.includes('pins') 
    ? 'pins' 
    : 'places';

  useEffect(() => {
    // Load data based on page type
    if (pageType === 'places') {
      const savedPlaces = localStorage.getItem('savedPlaces');
      if (savedPlaces) {
        setPlaces(JSON.parse(savedPlaces));
      }
    } else if (pageType === 'routes') {
      const savedRoutes = localStorage.getItem('savedRoutes');
      if (savedRoutes) {
        setRoutes(JSON.parse(savedRoutes));
      }
    } else if (pageType === 'pins') {
      const droppedPins = localStorage.getItem('droppedPins');
      if (droppedPins) {
        setPins(JSON.parse(droppedPins));
      }
    }
  }, [pageType]);

  const handleEdit = (itemId: string) => {
    setSelectedItem(null);
    alert('Edit functionality coming soon!');
  };

  const handleShare = (item: SavedPlace | SavedRoute | DroppedPin) => {
    setSelectedItem(null);
    if (navigator.share) {
      let title = '';
      let text = '';
      
      if (pageType === 'places') {
        const place = item as SavedPlace;
        title = place.name;
        text = place.address;
      } else if (pageType === 'routes') {
        const route = item as SavedRoute;
        title = route.name;
        text = `From: ${route.from}\nTo: ${route.to}`;
      } else {
        const pin = item as DroppedPin;
        title = 'Dropped Pin';
        text = pin.address;
      }
      
      navigator.share({ title, text, url: window.location.href }).catch(console.error);
    } else {
      alert('Share functionality not supported on this device');
    }
  };

  const handleDelete = (itemId: string) => {
    setSelectedItem(null);
    const confirmMsg = `Are you sure you want to delete this ${pageType === 'places' ? 'place' : pageType === 'routes' ? 'route' : 'pin'}?`;
    
    if (confirm(confirmMsg)) {
      if (pageType === 'places') {
        const updated = places.filter(p => p.id !== itemId);
        setPlaces(updated);
        localStorage.setItem('savedPlaces', JSON.stringify(updated));
      } else if (pageType === 'routes') {
        const updated = routes.filter(r => r.id !== itemId);
        setRoutes(updated);
        localStorage.setItem('savedRoutes', JSON.stringify(updated));
      } else {
        const updated = pins.filter(p => p.id !== itemId);
        setPins(updated);
        localStorage.setItem('droppedPins', JSON.stringify(updated));
      }
    }
  };

  const getTitle = () => {
    if (pageType === 'routes') return 'Saved Routes';
    if (pageType === 'pins') return 'Dropped Pins';
    return 'Saved Places';
  };

  const getEmptyIcon = () => {
    if (pageType === 'routes') return RouteIcon;
    if (pageType === 'pins') return Pin;
    return Landmark;
  };

  const getEmptyMessage = () => {
    if (pageType === 'routes') return 'No saved routes yet';
    if (pageType === 'pins') return 'No dropped pins yet';
    return 'No saved places yet';
  };

  const getEmptyDescription = () => {
    if (pageType === 'routes') return 'Save your frequent routes for quick access';
    if (pageType === 'pins') return 'Drop pins on the map to save locations';
    return 'Save your favorite locations for quick access';
  };

  const items = pageType === 'places' ? places : pageType === 'routes' ? routes : pins;
  const EmptyIcon = getEmptyIcon();

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
              <h1 className="text-xl font-semibold text-foreground">{getTitle()}</h1>
            </div>
            {pageType === 'places' && (
              <button
                onClick={() => navigate('/add-saved-place')}
                className="flex items-center gap-2 text-[#036A38] hover:text-[#025C31] transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-2xl">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <EmptyIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{getEmptyMessage()}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {getEmptyDescription()}
            </p>
            {pageType === 'places' && (
              <button
                onClick={() => navigate('/add-saved-place')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#036A38] hover:bg-[#025C31] text-white rounded-xl transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Place
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {pageType === 'places' && places.map((place) => {
              const Icon = iconMap[place.icon] || Landmark;
              const isMenuOpen = selectedItem === place.id;
              
              return (
                <div key={place.id} className="relative">
                  <div className="panel-green p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#036A38]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{place.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {place.address}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedItem(isMenuOpen ? null : place.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Options Menu */}
                  {isMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSelectedItem(null)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-4 top-16 z-50 w-48 panel-green overflow-hidden shadow-xl">
                        <button
                          onClick={() => handleEdit(place.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
                        >
                          <Edit2 className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground">Edit</span>
                        </button>
                        <button
                          onClick={() => handleShare(place)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
                        >
                          <Share2 className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground">Share</span>
                        </button>
                        <button
                          onClick={() => handleDelete(place.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {pageType === 'routes' && routes.map((route) => {
              const isMenuOpen = selectedItem === route.id;
              
              return (
                <div key={route.id} className="relative">
                  <div className="panel-green p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center flex-shrink-0">
                        <RouteIcon className="h-5 w-5 text-[#036A38]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{route.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          From: {route.from}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {route.to}
                        </p>
                        {route.distance && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {route.distance}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedItem(isMenuOpen ? null : route.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSelectedItem(null)} />
                      <div className="absolute right-4 top-16 z-50 w-48 panel-green overflow-hidden shadow-xl">
                        <button
                          onClick={() => handleEdit(route.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
                        >
                          <Edit2 className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground">Edit</span>
                        </button>
                        <button
                          onClick={() => handleShare(route)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
                        >
                          <Share2 className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground">Share</span>
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {pageType === 'pins' && pins.map((pin) => {
              const isMenuOpen = selectedItem === pin.id;
              const date = new Date(pin.timestamp);
              
              return (
                <div key={pin.id} className="relative">
                  <div className="panel-green p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#036A38]/10 flex items-center justify-center flex-shrink-0">
                        <Pin className="h-5 w-5 text-[#036A38]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">Dropped Pin</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {pin.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedItem(isMenuOpen ? null : pin.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSelectedItem(null)} />
                      <div className="absolute right-4 top-16 z-50 w-48 panel-green overflow-hidden shadow-xl">
                        <button
                          onClick={() => handleShare(pin)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
                        >
                          <Share2 className="h-4 w-4 text-foreground" />
                          <span className="text-sm text-foreground">Share</span>
                        </button>
                        <button
                          onClick={() => handleDelete(pin.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors text-left"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
