
"use client";

import { useState, useEffect, useCallback } from 'react';
import MapPicker from '@/components/map-picker';
import AirQualityDisplay from '@/components/air-quality-display';
import type { Location, ProcessedAirQualityData } from '@/services/air-quality';
import { getAirQuality } from '@/services/air-quality';
import { Wind, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [airQualityData, setAirQualityData] = useState<ProcessedAirQualityData | null>(null);
  const [isLoadingAirQuality, setIsLoadingAirQuality] = useState<boolean>(false);
  const [airQualityFetchError, setAirQualityFetchError] = useState<string | null>(null);
  
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | undefined>(undefined);
  const [googleMapsMapId, setGoogleMapsMapId] = useState<string | undefined>(undefined);
  const [isMapConfigLoading, setIsMapConfigLoading] = useState<boolean>(true);
  const [mapConfigError, setMapConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Client-side check for environment variables for map configuration
    const apiKeyEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapIdEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
    let currentMapConfigError = "";

    if (!apiKeyEnv) {
      console.warn("Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not set in .env.local.");
      currentMapConfigError += "Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is missing. ";
    } else {
      setGoogleMapsApiKey(apiKeyEnv);
    }

    if (!mapIdEnv) {
      console.warn("Google Maps Map ID (NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) is not set in .env.local.");
      currentMapConfigError += "Google Maps Map ID (NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) is missing. ";
    } else {
      setGoogleMapsMapId(mapIdEnv);
    }

    if (currentMapConfigError) {
      setMapConfigError(currentMapConfigError + "Please ensure it is set in your .env.local file and restart the application.");
    } else {
      setMapConfigError(null); // Clear any previous error if keys are found
    }
    setIsMapConfigLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on component mount to check env vars

  const fetchAirQuality = useCallback(async (location: Location) => {
    setIsLoadingAirQuality(true);
    setAirQualityFetchError(null); 
    setAirQualityData(null); 
    try {
      const data = await getAirQuality(location);
      setAirQualityData(data);
    } catch (err) {
      if (err instanceof Error) {
        setAirQualityFetchError(err.message);
      } else {
        setAirQualityFetchError('An unknown error occurred while fetching air quality data.');
      }
      setAirQualityData(null);
    } finally {
      setIsLoadingAirQuality(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchAirQuality(selectedLocation);
    }
  }, [selectedLocation, fetchAirQuality]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Wind className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">BreatheEasy</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="md:w-3/5 lg:w-2/3 h-[calc(100vh-200px)] min-h-[450px] md:h-auto md:min-h-[500px] rounded-lg overflow-hidden shadow-xl border border-border">
            {isMapConfigLoading && (
              <div className="flex items-center justify-center h-full bg-muted rounded-lg p-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Loading map configuration...</p>
              </div>
            )}
            {!isMapConfigLoading && mapConfigError && (
              <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg font-semibold">Map Configuration Error</p>
                <p className="text-muted-foreground mt-2 px-4">
                  {mapConfigError}
                </p>
                <p className="text-muted-foreground mt-3 text-sm">
                  If the issue persists after confirming <code className="bg-destructive/20 px-1 rounded">.env.local</code>, please check the browser console for more specific error messages from Google Maps (e.g., billing issues, API enablement, invalid key/ID).
                </p>
              </div>
            )}
            {!isMapConfigLoading && !mapConfigError && googleMapsApiKey && googleMapsMapId && (
               <MapPicker 
                onLocationSelect={handleLocationSelect} 
                apiKey={googleMapsApiKey}
                mapId={googleMapsMapId}
                initialCenter={{ lat: 52.52, lng: 13.41 }}
                selectedLocation={selectedLocation}
              />
            )}
          </div>
          <div className="md:w-2/5 lg:w-1/3 md:max-h-full md:overflow-y-auto">
            <AirQualityDisplay
              data={airQualityData}
              isLoading={isLoadingAirQuality}
              error={airQualityFetchError} 
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t border-border mt-auto">
        <p>&copy; {new Date().getFullYear()} BreatheEasy. Air quality data provided by Open-Meteo.com.</p>
      </footer>
    </div>
  );
}
