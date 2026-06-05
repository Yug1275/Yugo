import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom car icon using emoji rendered on canvas
const createCarIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #2563EB;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(37,99,235,0.4);
      ">🚗</div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const DriverMarker = ({ driver, position }) => {
  return (
    <Marker position={[position.lat, position.lng]} icon={createCarIcon()}>
      <Popup>
        <div style={{ minWidth: 130, padding: '2px 0' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>
            {driver?.userId?.name || 'Driver'}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
            ⭐ {driver?.rating || 'N/A'} · {driver?.vehicle?.vehicleType || 'Sedan'}
          </p>
          {driver?.vehicle?.vehicleNumber && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              🚘 {driver.vehicle.vehicleNumber}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default DriverMarker;