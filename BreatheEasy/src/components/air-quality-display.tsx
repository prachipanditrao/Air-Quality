
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MapPin, Wind, Cloud, Mountain } from 'lucide-react';
import type { ProcessedAirQualityData, Location } from '@/services/air-quality'; // Added Location
import { format } from 'date-fns';

interface AirQualityDisplayProps {
  data: ProcessedAirQualityData | null;
  isLoading: boolean;
  error: string | null;
  selectedLocation: Location | null; // Changed from { lat: number; lng: number }
}

interface PollutantLevelIndicatorProps {
  value: number | null;
  unit?: string;
  type: 'carbon_monoxide' | 'carbon_dioxide' | 'dust';
}

const PollutantLevelIndicator: FC<PollutantLevelIndicatorProps> = ({ value, unit, type }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  let colorClass = 'text-foreground'; // Default for moderate
  let levelText = 'Moderate';

  // Thresholds in µg/m³
  const thresholds = {
    carbon_monoxide: { low: 4400, high: 9400, very_high: 15400 }, // EPA based, approx conversion for common AQI
    carbon_dioxide: { low: 700 * 1800 , high: 1000 * 1800, very_high: 2000 * 1800 }, // Approx <700ppm (Low), 700-1000ppm (Moderate), 1000-2000ppm (High), >2000ppm (Very High) conversion: 1ppm CO2 = 1.8 mg/m3 = 1800 µg/m³
    dust: { low: 50, high: 150, very_high: 250 }, // General PM guideline
  };

  const currentThresholds = thresholds[type];

  if (value < currentThresholds.low) {
    colorClass = 'text-accent'; // Green for low
    levelText = 'Low';
  } else if (value > currentThresholds.very_high) {
    colorClass = 'text-destructive'; // Red for very high
    levelText = 'Very High';
  } else if (value > currentThresholds.high) {
    colorClass = 'text-destructive/80'; // Lighter Red for high
    levelText = 'High';
  }
  // Moderate remains default

  return (
    <>
      <span className={`${colorClass} font-semibold`}>{value.toFixed(2)}</span>
      {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      <span className={`ml-2 font-semibold ${colorClass}`}>({levelText})</span>
    </>
  );
};


const AirQualityDisplay: FC<AirQualityDisplayProps> = ({ data, isLoading, error, selectedLocation }) => {
  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => ( // Skeleton for 3 items: CO, CO2, Dust
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!selectedLocation) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary">Air Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please select a location on the map to view air quality data.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
     return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary">Air Quality Data</CardTitle>
           <CardDescription>
            For location: Lat: {selectedLocation.lat.toFixed(2)}, Lng: {selectedLocation.lng.toFixed(2)}
            {data?.address && <span className="block text-xs pt-1">{data.address}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No air quality data available for the selected location.</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timeString: string | null, timezone?: string) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return format(date, "MMM d, yyyy HH:mm") + (timezone ? ` (${timezone})` : ' (UTC)');
    } catch {
      return timeString; 
    }
  };


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary flex items-center">
          <MapPin className="mr-2 h-6 w-6" /> Air Quality Report
        </CardTitle>
        {data.location && (
          <CardDescription>
            Coordinates: Lat {data.location.lat.toFixed(2)}, Lng {data.location.lng.toFixed(2)}
            {data.address && <span className="block text-xs pt-1">{data.address}</span>}
            {data.timezone && <span className="block text-xs pt-1">Timezone: {data.timezone}</span>}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-start space-x-4 p-3 bg-secondary/30 rounded-md">
          <Wind className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="min-w-0">
            <h3 className="font-semibold text-lg">Carbon Monoxide (CO)</h3>
            <p className="text-2xl break-words">
              <PollutantLevelIndicator value={data.carbonMonoxide} unit={data.carbonMonoxideUnit} type="carbon_monoxide" />
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatTime(data.carbonMonoxideTime, data.timezone)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-3 bg-secondary/30 rounded-md">
          <Cloud className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="min-w-0">
            <h3 className="font-semibold text-lg">Carbon Dioxide (CO₂)</h3>
            <p className="text-2xl break-words">
              <PollutantLevelIndicator value={data.carbonDioxide} unit={data.carbonDioxideUnit} type="carbon_dioxide" />
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatTime(data.carbonDioxideTime, data.timezone)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-3 bg-secondary/30 rounded-md">
          <Mountain className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="min-w-0">
            <h3 className="font-semibold text-lg">Dust</h3>
            <p className="text-2xl break-words">
              <PollutantLevelIndicator value={data.dust} unit={data.dustUnit} type="dust" />
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatTime(data.dustTime, data.timezone)}
            </p>
          </div>
        </div>

        { (data.carbonMonoxide === null && data.carbonDioxide === null && data.dust === null) &&
          <p className="text-sm text-muted-foreground text-center pt-2">Detailed air quality data might not be available for this specific point or time. Try a nearby major area.</p>
        }
      </CardContent>
    </Card>
  );
};

export default AirQualityDisplay;
