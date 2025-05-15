
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, type MapMouseEvent, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import type { Location } from '@/services/air-quality';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react'; // Renamed to avoid conflict

interface MapPickerProps {
  onLocationSelect: (location: Location, address?: string) => void;
  initialCenter?: Location;
  apiKey: string;
  mapId: string;
  selectedLocation: Location | null;
}

// Component to integrate Autocomplete
const PlaceAutocomplete: FC<{
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  apiKey: string; // Pass API key explicitly if not using APIProvider at this level, but it should be inherited
}> = ({ onPlaceSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places'); // This hook provides the 'places' library
  // No need for a state for 'autocomplete' instance itself unless debugging it.

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const ac = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address', 'address_components'], // Define what data to return
      types: ['geocode', 'establishment'], // Bias towards geocoding results or specific places
    });

    const listener = ac.addListener('place_changed', () => {
      const placeResult = ac.getPlace();
      onPlaceSelect(placeResult);
      // Optionally clear input or set to formatted address
      // setInputValue(placeResult.formatted_address || placeResult.name || '');
    });

    return () => {
      // google.maps.event.clearInstanceListeners(ac) is important for cleanup
      // but can be tricky if 'ac' instance is not stable or recreated.
      // The @vis.gl/react-google-maps might handle some cleanup implicitly when the component unmounts.
      // For robust cleanup:
      if (ac && google.maps.event) {
         google.maps.event.clearInstanceListeners(ac);
      }
      // If 'ac' was stored in state and cleared, this would be more direct.
      // However, direct usage like this is common.
    };
  }, [places, onPlaceSelect]);

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-10 pr-3 py-2 shadow-md border border-border focus:ring-primary focus:border-primary"
      />
    </div>
  );
};


const MapPickerInternal: FC<MapPickerProps> = ({ onLocationSelect, initialCenter, mapId, selectedLocation }) => {
  const [markerPosition, setMarkerPosition] = useState<Location | null>(selectedLocation);
  const [mapCenter, setMapCenter] = useState<Location>(selectedLocation || initialCenter || { lat: 20, lng: 0 });
  const map = useMap(); // Hook to get map instance for controlling it

  useEffect(() => {
    if (selectedLocation) {
      setMarkerPosition(selectedLocation);
      setMapCenter(selectedLocation); // Keep map centered on the selected location
      if (map) {
        map.panTo(selectedLocation);
        map.setZoom(8); // Zoom in when a location is selected
      }
    } else if (initialCenter && !selectedLocation) {
        setMapCenter(initialCenter);
        if (map) {
            map.panTo(initialCenter);
            map.setZoom(3); // Default zoom if no location selected
        }
    }
  }, [selectedLocation, initialCenter, map]);
  
  const handleMapClick = (event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const newLocation = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng,
      };
      onLocationSelect(newLocation); 
    }
  };

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
      const newLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      const address = place.formatted_address || place.name;
      onLocationSelect(newLocation, address);
    }
  }, [onLocationSelect]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        {/* PlaceAutocomplete is now inside MapPickerInternal which is child of APIProvider */}
        <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} apiKey="" /> 
      </div>
      <Map
        key={mapId} // Ensures map re-initializes if mapId changes
        zoom={markerPosition ? 8 : 3}
        center={mapCenter}
        onCenterChanged={(ev) => {
          if (ev.detail.center.lat && ev.detail.center.lng) {
            // Only update mapCenter state if user manually pans, not driven by selectedLocation
            // This check helps prevent feedback loops if map.panTo also triggers onCenterChanged
            if (!selectedLocation || (selectedLocation.lat !== ev.detail.center.lat || selectedLocation.lng !== ev.detail.center.lng)) {
                 setMapCenter({ lat: ev.detail.center.lat, lng: ev.detail.center.lng});
            }
          }
        }}
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
    </div>
  );
};

// Wrapper component that includes APIProvider
const MapPickerWrapper: FC<MapPickerProps> = (props) => {
  // APIProvider must be an ancestor of any component using useMap or useMapsLibrary
  return (
    <APIProvider apiKey={props.apiKey}>
      <MapPickerInternal {...props} />
    </APIProvider>
  );
};

export default MapPickerWrapper;
