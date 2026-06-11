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
import { useRideEmitter } from '../../hooks/useRideSocket';


const STEPS = { SELECT: 'select', CONFIRM: 'confirm' };

const BookRide = () => {
  const navigate = useNavigate();
  const { emitNewRide } = useRideEmitter();
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
    const rideId = res.data.data._id;

    // Notify drivers via socket
    emitNewRide(rideId);

    navigate(`/rider/tracking/${rideId}`);
  } catch (err) {
    setBookingError(err.response?.data?.error || 'Failed to book ride. Try again.');
    setBookingLoading(false);
  }
};

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Book a Ride</h2>
        <p className="page-subtitle">Enter your pickup and destination</p>
      </div>

      <div className="book-ride-grid">
        {/* ─── Left panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Card gradient header */}
            <div
              style={{
                background: 'var(--gradient-primary)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {step === STEPS.SELECT ? '📍' : '✅'}
              </span>
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px' }}>
                  {step === STEPS.SELECT ? 'Where to?' : 'Confirm Booking'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                  {step === STEPS.SELECT ? 'Set your pickup and destination' : 'Review your ride details'}
                </p>
              </div>
            </div>

            <div style={{ padding: 20 }}>
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
                      padding: '10px 14px',
                      background: 'var(--color-primary-light)',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: 10,
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: geoLoading ? 'not-allowed' : 'pointer',
                      marginBottom: 14,
                      opacity: geoLoading ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!geoLoading) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
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

                  {/* Location inputs with visual connecting line */}
                  <div style={{ position: 'relative' }}>
                    <LocationSearchInput
                      label="Pickup location"
                      placeholder="Search pickup point..."
                      value={pickup}
                      icon="🟢"
                      onPlaceSelected={handlePickupSelect}
                      onClear={() => { setPickup(null); setRouteInfo(null); setRouteCoordinates(null); }}
                      required
                    />

                    {/* Connecting dotted line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 7,
                        top: 38,
                        width: 2,
                        height: 16,
                        borderLeft: '2px dashed var(--color-border)',
                        zIndex: 1,
                      }}
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
                  </div>

                  {/* Route loading indicator */}
                  {routeLoading && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                      Calculating route...
                    </p>
                  )}

                  {/* Route info chips */}
                  {routeInfo && !routeLoading && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <div
                        className="card-sm"
                        style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--color-surface-2)' }}
                      >
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Distance</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{routeInfo.distanceText}</p>
                      </div>
                      <div
                        className="card-sm"
                        style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--color-surface-2)' }}
                      >
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{routeInfo.durationText}</p>
                      </div>
                      {estimatedFare && (
                        <div
                          className="card-sm"
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '8px',
                            background: 'var(--gradient-primary)',
                            border: 'none',
                          }}
                        >
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Est. Fare</p>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                  {/* Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      { label: 'Pickup', icon: '🟢' },
                      { label: 'Route', icon: '🛣️' },
                      { label: 'Destination', icon: '🔴' },
                    ].map((s, i, arr) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--gradient-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                          >
                            {s.icon}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {s.label}
                          </p>
                        </div>
                        {i < arr.length - 1 && (
                          <div
                            style={{
                              width: 40,
                              height: 2,
                              background: 'var(--gradient-primary)',
                              margin: '0 4px',
                              marginBottom: 20,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Route summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 12px',
                        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                        borderRadius: 10,
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <span>🟢</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>PICKUP</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>{pickup?.address}</p>
                      </div>
                    </div>
                    <div style={{ borderLeft: '2px dashed var(--color-border)', marginLeft: 18, height: 10 }} />
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 12px',
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        borderRadius: 10,
                        border: '1px solid #fecaca',
                      }}
                    >
                      <span>🔴</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#991b1b', fontWeight: 700 }}>DESTINATION</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>{destination?.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Route info */}
                  {routeInfo && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Distance</p>
                        <p style={{ margin: 0, fontWeight: 700 }}>{routeInfo.distanceText}</p>
                      </div>
                      <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration</p>
                        <p style={{ margin: 0, fontWeight: 700 }}>{routeInfo.durationText}</p>
                      </div>
                    </div>
                  )}

                  {/* Fare — premium chip */}
                  {estimatedFare && (
                    <div
                      style={{
                        background: 'var(--gradient-primary)',
                        borderRadius: 14,
                        padding: '16px 18px',
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.5px' }}>
                          ESTIMATED FARE
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                          Final fare may vary
                        </p>
                      </div>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {formatCurrency(estimatedFare)}
                      </span>
                    </div>
                  )}

                  {/* Nearby drivers */}
                  {nearbyDrivers.length > 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                      {nearbyDrivers.length} driver{nearbyDrivers.length > 1 ? 's' : ''} nearby
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: 600, marginBottom: 12 }}>
                      ⚠️ No drivers nearby right now. You can still book.
                    </p>
                  )}

                  {bookingError && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        border: '1px solid #fecaca',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 12,
                        fontSize: '0.85rem',
                        color: '#991b1b',
                      }}
                    >
                      ⚠️ {bookingError}
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
              padding: '10px 14px',
              background: 'var(--color-surface)',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
              boxShadow: 'var(--shadow-sm)',
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