import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Workaround for Leaflet marker icon issue with bundlers
// Need to redefine the marker icon path since the bundling process breaks it
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
  zoom?: number;
  height?: string;
  interactive?: boolean;
}

export function MapView({ 
  lat, 
  lng, 
  title = 'Location', 
  className = '',
  zoom = 13,
  height = '300px',
  interactive = true
}: MapViewProps) {
  const mapRef = useRef(null);

  // Fix for issue where map doesn't render correctly after container is visible
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        (mapRef.current as any)?.invalidateSize();
      }, 100);
    }
  }, [mapRef.current]);

  if (!lat || !lng) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-lg", className)}
        style={{ height }}>
        <MapPin className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No location available</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg overflow-hidden", className)} style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}