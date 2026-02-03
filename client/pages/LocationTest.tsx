import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  checkUserLocationForNigeria, 
  isLocationInNigeria, 
  getDistanceFromNigeria,
  KNOWN_LOCATIONS,
  type LocationCheckResult 
} from '@/lib/locationUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LocationTest() {
  const [locationResult, setLocationResult] = useState<LocationCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    location: string;
    isInNigeria: boolean;
    distance: number;
  }>>([]);

  const checkCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await checkUserLocationForNigeria();
      setLocationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check location');
    } finally {
      setIsLoading(false);
    }
  };

  const testKnownLocations = () => {
    const results = Object.entries(KNOWN_LOCATIONS).map(([key, location]) => ({
      location: location.name,
      isInNigeria: isLocationInNigeria(location.lat, location.lng),
      distance: Math.round(getDistanceFromNigeria(location.lat, location.lng))
    }));
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display">Location Testing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test the Nigeria location detection system. This page demonstrates how NINja Map 
            detects if users are inside or outside Nigeria and shows appropriate messages.
          </p>
        </div>

        {/* Current Location Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Your Current Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkCurrentLocation} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Check My Location
                </>
              )}
            </Button>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {locationResult && (
              <Alert className={`${
                locationResult.isInNigeria 
                  ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' 
                  : 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  {locationResult.isInNigeria ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <Globe className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${
                          locationResult.isInNigeria 
                            ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300'
                            : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {locationResult.isInNigeria ? 'Inside Nigeria' : 'Outside Nigeria'}
                      </Badge>
                    </div>
                    <AlertDescription className={`${
                      locationResult.isInNigeria 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {locationResult.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Known Locations Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Test Known Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testKnownLocations}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test All Locations
            </Button>

            {testResults.length > 0 && (
              <div className="grid gap-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.isInNigeria 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                        : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.isInNigeria ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Globe className="h-5 w-5 text-amber-600" />
                        )}
                        <div>
                          <div className="font-medium">{result.location}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.distance} km from Nigeria center
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          result.isInNigeria 
                            ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300'
                            : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {result.isInNigeria ? 'Inside' : 'Outside'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Location Detection:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Uses browser's geolocation API to get your coordinates</li>
                <li>Checks if coordinates fall within Nigeria's boundaries</li>
                <li>Shows appropriate message based on your location</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Nigeria Boundaries:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>North: 13.9° (near Chad/Niger border)</li>
                <li>South: 4.3° (Gulf of Guinea)</li>
                <li>West: 2.7° (near Benin border)</li>
                <li>East: 14.7° (near Cameroon border)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Example Locations:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Inside Nigeria:</strong> Lagos, Abuja, Kano</li>
                <li><strong>Outside Nigeria:</strong> Indore (India), London (UK), New York (USA)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}