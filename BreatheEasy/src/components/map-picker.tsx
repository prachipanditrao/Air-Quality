
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, type MapMouseEvent } from '@vis.gl/react-google-maps';
import type { Location } from '@/services/air-quality';

interface MapPickerProps {
  onLocationSelect: (location: Location) => void;
  initialCenter?: Location;
  apiKey: string; // Changed from string | undefined
  mapId: string;  // Changed from string | undefined
  selectedLocation: Location | null;
}

const MapPicker: FC<MapPickerProps> = ({ onLocationSelect, initialCenter, apiKey, mapId, selectedLocation }) => {
  const [markerPosition, setMarkerPosition] = useState<Location | null>(selectedLocation || initialCenter || null);
  const [mapCenter, setMapCenter] = useState<Location>(selectedLocation || initialCenter || { lat: 20, lng: 0 });

  useEffect(() => {
    setMarkerPosition(selectedLocation || initialCenter || null);
    if (selectedLocation) {
      setMapCenter(selectedLocation);
    } else if (initialCenter) {
      setMapCenter(initialCenter);
    }
  }, [selectedLocation, initialCenter]);
  
  const handleMapClick = (event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const newLocation = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng,
      };
      setMarkerPosition(newLocation);
      onLocationSelect(newLocation);
    }
  };

  // The checks for apiKey and mapId are removed here because page.tsx
  // already ensures that MapPicker is only rendered if both are valid strings.
  // The error/message display for missing keys is handled in page.tsx.

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        zoom={markerPosition ? 6 : 3}
        center={mapCenter}
        onCenterChanged={(ev) => setMapCenter({ lat: ev.detail.center.lat, lng: ev.detail.center.lng})}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClick}
        className="w-full h-full rounded-lg shadow-md"
        mapId={mapId}
      >
        {markerPosition && (
          <AdvancedMarker position={markerPosition} title="Selected Location">
            <Pin
              background={'hsl(var(--primary))'}
              borderColor={'hsl(var(--primary-foreground))'}
              glyphColor={'hsl(var(--primary-foreground))'}
            />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapPicker;
