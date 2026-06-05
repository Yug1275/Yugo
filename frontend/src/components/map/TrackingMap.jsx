import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteRenderer from './RouteRenderer';
import { DEFAULT_CENTER } from '../../utils/mapHelpers';

const createIcon = (color, emoji) =>
  L.divIcon({
    html: `
      <div style="
        background:${color};
        border:2.5px solid #fff;
        border-radius:50%;
        width:32px;height:32px;
        display:flex;align-items:center;justify-content:center;
        font-size:15px;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
      ">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const PICKUP_ICON      = () => createIcon('#22c55e', '🟢');
const DESTINATION_ICON = () => createIcon('#ef4444', '🔴');
const DRIVER_ICON      = () => createIcon('#2563EB', '🚗');

// Auto-pan to driver location as it updates
const AutoPan = ({ center }) => {
  const map = useMap();
  const firstRender = useRef(true);

  useEffect(() => {
    if (!center) return;
    if (firstRender.current) {
      map.setView([center.lat, center.lng], 14);
      firstRender.current = false;
    } else {
      map.panTo([center.lat, center.lng]);
    }
  }, [center]);

  return null;
};

const TrackingMap = ({
  pickup,
  destination,
  driverLocation,
  routeCoordinates,
  height = '400px',
}) => {
  return (
    <div
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
          driverLocation
            ? [driverLocation.lat, driverLocation.lng]
            : pickup?.coordinates
            ? [pickup.coordinates.lat, pickup.coordinates.lng]
            : DEFAULT_CENTER
        }
        zoom={14}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoPan center={driverLocation} />

        {pickup?.coordinates && (
          <Marker
            position={[pickup.coordinates.lat, pickup.coordinates.lng]}
            icon={PICKUP_ICON()}
          >
            <Popup>🟢 Pickup: {pickup.address}</Popup>
          </Marker>
        )}

        {destination?.coordinates && (
          <Marker
            position={[destination.coordinates.lat, destination.coordinates.lng]}
            icon={DESTINATION_ICON()}
          >
            <Popup>🔴 Destination: {destination.address}</Popup>
          </Marker>
        )}

        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={DRIVER_ICON()}
          >
            <Popup>🚗 Driver is here</Popup>
          </Marker>
        )}

        {routeCoordinates && <RouteRenderer coordinates={routeCoordinates} />}
      </LeafletMap>
    </div>
  );
};

export default TrackingMap;