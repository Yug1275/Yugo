import { Polyline } from 'react-leaflet';

const RouteRenderer = ({ coordinates }) => {
  if (!coordinates || coordinates.length === 0) return null;

  return (
    <Polyline
      positions={coordinates}
      pathOptions={{
        color: '#2563EB',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      }}
    />
  );
};

export default RouteRenderer;