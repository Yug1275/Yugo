import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteRenderer from './RouteRenderer';
import DriverMarker from './DriverMarker';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/mapHelpers';

// Custom icons
const createIcon = (color, emoji) =>
  L.divIcon({
    html: `
      <div style="
        background: ${color};
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">${emoji}</div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const CURRENT_ICON = () => createIcon('#2563EB', '🔵');
const PICKUP_ICON = () => createIcon('#22c55e', '🟢');
const DESTINATION_ICON = () => createIcon('#ef4444', '🔴');

// ─── Inner component to auto fit bounds ───────────────────────────────────
const FitBounds = ({ pickup, destination, currentLocation }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup?.coordinates) points.push([pickup.coordinates.lat, pickup.coordinates.lng]);
    if (destination?.coordinates) points.push([destination.coordinates.lat, destination.coordinates.lng]);
    if (currentLocation) points.push([currentLocation.lat, currentLocation.lng]);

    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [pickup, destination, currentLocation]);

  return null;
};

// ─── Main MapContainer ─────────────────────────────────────────────────────
const MapContainer = ({
  currentLocation,
  pickup,
  destination,
  routeCoordinates,
  nearbyDrivers = [],
  height = '420px',
}) => {
  return (
    <div
      className="responsive-map"
      style={{
        width: '100%',
        height,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 0,
      }}
    >
      <LeafletMap
        center={
          currentLocation
            ? [currentLocation.lat, currentLocation.lng]
            : DEFAULT_CENTER
        }
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        {/* OpenStreetMap tiles — completely free */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds */}
        <FitBounds
          pickup={pickup}
          destination={destination}
          currentLocation={currentLocation}
        />

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={CURRENT_ICON()}
          >
            <Popup>📍 Your current location</Popup>
          </Marker>
        )}

        {/* Pickup marker */}
        {pickup?.coordinates && (
          <Marker
            position={[pickup.coordinates.lat, pickup.coordinates.lng]}
            icon={PICKUP_ICON()}
          >
            <Popup>🟢 Pickup: {pickup.address}</Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination?.coordinates && (
          <Marker
            position={[destination.coordinates.lat, destination.coordinates.lng]}
            icon={DESTINATION_ICON()}
          >
            <Popup>🔴 Destination: {destination.address}</Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {routeCoordinates && (
          <RouteRenderer coordinates={routeCoordinates} />
        )}

        {/* Nearby driver markers */}
        {nearbyDrivers.map((driver) =>
          driver.currentLocation?.lat ? (
            <DriverMarker
              key={driver._id}
              driver={driver}
              position={driver.currentLocation}
            />
          ) : null
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;