import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../../components/map/MapContainer';
import LocationSearchInput from '../../components/map/LocationSearchInput';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import useGeolocation from '../../hooks/useGeolocation';
import {
  estimateFareFromDistance,
  getDistanceKm,
  fetchRoute,
  reverseGeocode,
} from '../../utils/mapHelpers';
import { createRideApi, getNearbyDriversApi } from '../../api/rideApi';
import { formatCurrency } from '../../utils/helpers';

const STEPS = { SELECT: 'select', CONFIRM: 'confirm' };

const BookRide = () => {
  const navigate = useNavigate();
  const { location: currentLocation, loading: geoLoading, error: geoError, getCurrentLocation } = useGeolocation();

  const [step, setStep] = useState(STEPS.SELECT);
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);

  const estimatedFare = routeInfo
    ? estimateFareFromDistance(routeInfo.distanceKm)
    : pickup?.coordinates && destination?.coordinates
    ? estimateFareFromDistance(getDistanceKm(pickup.coordinates, destination.coordinates))
    : null;

  // Use current location as pickup
  const handleUseCurrentLocation = () => {
    getCurrentLocation(async (coords) => {
      const address = await reverseGeocode(coords.lat, coords.lng);
      setPickup({ address, coordinates: coords });
    });
  };

  // Fetch route when both pickup and destination are set
  const handleFetchRoute = useCallback(async (pickupData, destinationData) => {
    if (!pickupData?.coordinates || !destinationData?.coordinates) return;
    setRouteLoading(true);
    const route = await fetchRoute(pickupData.coordinates, destinationData.coordinates);
    if (route) {
      setRouteCoordinates(route.coordinates);
      setRouteInfo({
        distanceKm: route.distanceKm,
        durationMin: route.durationMin,
        distanceText: route.distanceText,
        durationText: route.durationText,
      });
    }
    setRouteLoading(false);
  }, []);

  const handlePickupSelect = (place) => {
    setPickup(place);
    if (destination) handleFetchRoute(place, destination);
  };

  const handleDestinationSelect = (place) => {
    setDestination(place);
    if (pickup) handleFetchRoute(pickup, place);
  };

  const handleProceedToConfirm = async () => {
    if (!pickup || !destination) return;
    try {
      const res = await getNearbyDriversApi(
        pickup.coordinates.lat,
        pickup.coordinates.lng
      );
      setNearbyDrivers(res.data.data || []);
    } catch {
      setNearbyDrivers([]);
    }
    setStep(STEPS.CONFIRM);
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await createRideApi({
        pickup,
        destination,
        fare: estimatedFare,
        distanceKm: routeInfo?.distanceKm || null,
        durationMin: routeInfo?.durationMin || null,
      });
      navigate(`/rider/tracking/${res.data.data._id}`);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to book ride. Try again.');
      setBookingLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Book a Ride</h2>
        <p className="page-subtitle">Enter your pickup and destination</p>
      </div>

      <div className="book-ride-grid">
        {/* ─── Left panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h4 style={{ marginBottom: 16 }}>
              {step === STEPS.SELECT ? '📍 Set Locations' : '✅ Confirm Booking'}
            </h4>

            {/* ── STEP 1: Location selection ── */}
            {step === STEPS.SELECT && (
              <>
                {/* Current location button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--color-primary-light)',
                    border: '1.5px solid var(--color-primary)',
                    borderRadius: 8,
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: geoLoading ? 'not-allowed' : 'pointer',
                    marginBottom: 14,
                    opacity: geoLoading ? 0.7 : 1,
                  }}
                >
                  {geoLoading ? (
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : '🎯'}
                  Use my current location as pickup
                </button>

                {geoError && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: 10 }}>
                    {geoError}
                  </p>
                )}

                <LocationSearchInput
                  label="Pickup location"
                  placeholder="Search pickup point..."
                  value={pickup}
                  icon="🟢"
                  onPlaceSelected={handlePickupSelect}
                  onClear={() => { setPickup(null); setRouteInfo(null); setRouteCoordinates(null); }}
                  required
                />

                <LocationSearchInput
                  label="Destination"
                  placeholder="Where are you going?"
                  value={destination}
                  icon="🔴"
                  onPlaceSelected={handleDestinationSelect}
                  onClear={() => { setDestination(null); setRouteInfo(null); setRouteCoordinates(null); }}
                  required
                />

                {/* Route loading indicator */}
                {routeLoading && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', marginBottom: 10 }}>
                    ⏳ Calculating route...
                  </p>
                )}

                {/* Route info chips */}
                {routeInfo && !routeLoading && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div className="card-sm" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Distance</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{routeInfo.distanceText}</p>
                    </div>
                    <div className="card-sm" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Duration</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{routeInfo.durationText}</p>
                    </div>
                    {estimatedFare && (
                      <div
                        className="card-sm"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '8px',
                          background: 'var(--color-primary-light)',
                          borderColor: 'var(--color-primary)',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-primary)' }}>Est. Fare</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                          {formatCurrency(estimatedFare)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  disabled={!pickup || !destination}
                  onClick={handleProceedToConfirm}
                >
                  Find Drivers →
                </Button>
              </>
            )}

            {/* ── STEP 2: Confirm ── */}
            {step === STEPS.CONFIRM && (
              <>
                {/* Route summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span>🟢</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PICKUP</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{pickup?.address}</p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span>🔴</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>DESTINATION</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{destination?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Route info */}
                {routeInfo && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Distance</p>
                      <p style={{ margin: 0, fontWeight: 700 }}>{routeInfo.distanceText}</p>
                    </div>
                    <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Duration</p>
                      <p style={{ margin: 0, fontWeight: 700 }}>{routeInfo.durationText}</p>
                    </div>
                  </div>
                )}

                {/* Fare */}
                {estimatedFare && (
                  <div
                    style={{
                      background: 'var(--color-primary-light)',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: 10,
                      padding: '14px 16px',
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        ESTIMATED FARE
                      </p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        Final fare may vary
                      </p>
                    </div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatCurrency(estimatedFare)}
                    </span>
                  </div>
                )}

                {/* Nearby drivers */}
                {nearbyDrivers.length > 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: 12 }}>
                    🚗 {nearbyDrivers.length} driver{nearbyDrivers.length > 1 ? 's' : ''} nearby
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: 600, marginBottom: 12 }}>
                    ⚠️ No drivers nearby right now. You can still book.
                  </p>
                )}

                {bookingError && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 12,
                      fontSize: '0.85rem',
                      color: '#991b1b',
                    }}
                  >
                    {bookingError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => { setStep(STEPS.SELECT); setBookingError(''); }}
                  >
                    ← Back
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={bookingLoading}
                    onClick={handleConfirmBooking}
                  >
                    Confirm Ride
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Right panel: Map ──────────────────────────────── */}
        <div className="map-panel">
          <MapContainer
            currentLocation={currentLocation}
            pickup={pickup}
            destination={destination}
            routeCoordinates={routeCoordinates}
            nearbyDrivers={nearbyDrivers}
            height="420px"
          />

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 10,
              padding: '8px 12px',
              background: 'var(--color-surface)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span>🔵 You</span>
            <span>🟢 Pickup</span>
            <span>🔴 Destination</span>
            <span>🚗 Driver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRide;