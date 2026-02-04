import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Briefcase, MapPin, Route, Pin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyPlaces() {
  const navigate = useNavigate();
  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [workAddress, setWorkAddress] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [droppedPins, setDroppedPins] = useState<any[]>([]);

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const savedHome = localStorage.getItem('homeAddress');
    const savedWork = localStorage.getItem('workAddress');
    
    if (savedHome) {
      setHomeAddress(savedHome);
    }
    if (savedWork) {
      setWorkAddress(savedWork);
    }

    // Load counts
    const places = localStorage.getItem('savedPlaces');
    const routes = localStorage.getItem('savedRoutes');
    const pins = localStorage.getItem('droppedPins');

    if (places) {
      setSavedPlaces(JSON.parse(places));
    }
    if (routes) {
      setSavedRoutes(JSON.parse(routes));
    }
    if (pins) {
      setDroppedPins(JSON.parse(pins));
    }
  }, []);

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
              <h1 className="text-xl font-semibold text-foreground">My Places</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 max-w-2xl">
        <div className="space-y-4">
          {/* Home */}
          <button
            onClick={() => navigate('/add-place?type=home')}
            className="w-full panel-green p-5 hover:bg-muted/5 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-[#036A38]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">Home</h3>
                  {homeAddress ? (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {homeAddress}
                    </p>
                  ) : (
                    <p className="text-sm text-[#036A38]">Add Home</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          </button>

          {/* Work */}
          <button
            onClick={() => navigate('/add-place?type=work')}
            className="w-full panel-green p-5 hover:bg-muted/5 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-[#036A38]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">Work</h3>
                  {workAddress ? (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {workAddress}
                    </p>
                  ) : (
                    <p className="text-sm text-[#036A38]">Add Work</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          </button>

          {/* Places, Routes, and Dropped Pins Container */}
          <div className="panel-green overflow-hidden">
            {/* Places */}
            <button
              onClick={() => navigate('/saved-places')}
              className="w-full p-5 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Places</h3>
                  <p className="text-sm text-muted-foreground">
                    {savedPlaces.length} {savedPlaces.length === 1 ? 'Place' : 'Places'}
                  </p>
                </div>
              </div>
            </button>

            {/* Routes */}
            <button
              onClick={() => navigate('/saved-routes')}
              className="w-full p-5 hover:bg-muted/5 transition-colors text-left border-b border-border/40"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <Route className="h-6 w-6 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Routes</h3>
                  <p className="text-sm text-muted-foreground">
                    {savedRoutes.length} {savedRoutes.length === 1 ? 'Route' : 'Routes'}
                  </p>
                </div>
              </div>
            </button>

            {/* Dropped Pins */}
            <button
              onClick={() => navigate('/dropped-pins')}
              className="w-full p-5 hover:bg-muted/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#036A38]/10 flex items-center justify-center">
                  <Pin className="h-6 w-6 text-[#036A38]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Dropped Pins</h3>
                  <p className="text-sm text-muted-foreground">
                    {droppedPins.length} {droppedPins.length === 1 ? 'Pin' : 'Pins'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
