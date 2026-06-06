import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import useSocket from './useSocket';

// ─── For RIDERS: listen for ride status updates + driver location ─────────
export const useRiderSocket = (rideId, onDriverLocationUpdate, onStatusChange) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !rideId) return;

    // Subscribe to this ride's updates
    console.log('Listening for ride status & location updates for', rideId);
    socket.emit('ride:subscribe', { rideId });

    // Listen for status changes
    const handleStatusUpdate = (data) => {
      if (data.rideId?.toString() !== rideId?.toString()) return;
      console.log('🚦 Ride status update:', data.status);
      if (onStatusChange) onStatusChange(data);
    };

    // Listen for driver location updates
    const handleDriverLocation = (data) => {
      if (data.rideId?.toString() !== rideId?.toString()) return;
      if (onDriverLocationUpdate) onDriverLocationUpdate(data.location);
    };

    // Listen for ride cancelled
    const handleCancelled = (data) => {
      if (data.rideId?.toString() !== rideId?.toString()) return;
      if (onStatusChange) onStatusChange({ ...data, status: 'cancelled' });
    };

    socket.on('ride:statusUpdate', handleStatusUpdate);
    socket.on('driver:locationUpdate', handleDriverLocation);
    socket.on('ride:cancelled', handleCancelled);

    return () => {
      socket.off('ride:statusUpdate', handleStatusUpdate);
      socket.off('driver:locationUpdate', handleDriverLocation);
      socket.off('ride:cancelled', handleCancelled);
    };
  }, [socket, rideId]);
};

// ─── For DRIVERS: listen for new ride requests ────────────────────────────
export const useDriverSocket = (onNewRide, onRideTakenOff) => {
  const socket = useSocket();
  const availability = useSelector((s) => s.driver.availability);

  useEffect(() => {
    if (!socket) return;

    console.log('Listening for ride:newRequest on driver socket (availability=', availability, ')');

    const handleNewRequest = (data) => {
      console.log('🔔 New ride request (socket):', data.rideId);
      if (onNewRide) onNewRide(data);
    };

    const handleTakenOff = (data) => {
      console.log('🚫 Ride taken off (socket):', data.rideId);
      if (onRideTakenOff) onRideTakenOff(data.rideId);
    };

    const handleCancelledByRider = (data) => {
      console.log('❌ Ride cancelled by rider (socket):', data.rideId);
      if (onRideTakenOff) onRideTakenOff(data.rideId);
    };

    // Join driver room only when driver is available/online
    if (availability) {
      socket.emit('driver:join', {});
      console.log('Emitted driver:join (driver is available)');
    }

    socket.on('ride:newRequest', handleNewRequest);
    socket.on('ride:takenOff', handleTakenOff);
    socket.on('ride:cancelled', handleCancelledByRider);

    return () => {
      socket.off('ride:newRequest', handleNewRequest);
      socket.off('ride:takenOff', handleTakenOff);
      socket.off('ride:cancelled', handleCancelledByRider);
    };
  }, [socket, availability, onNewRide, onRideTakenOff]);
};

// ─── Emit helpers ─────────────────────────────────────────────────────────
export const useRideEmitter = () => {
  const socket = useSocket();

  const emitNewRide = useCallback((rideId) => {
    if (socket) socket.emit('ride:new', { rideId });
  }, [socket]);

  const emitLocationUpdate = useCallback((lat, lng, rideId) => {
    if (socket) socket.emit('driver:location', { lat, lng, rideId });
  }, [socket]);

  const emitAcceptRide = useCallback((rideId) => {
    if (socket) socket.emit('ride:accept', { rideId });
  }, [socket]);

  const emitStartRide = useCallback((rideId) => {
    if (socket) socket.emit('ride:start', { rideId });
  }, [socket]);

  const emitCompleteRide = useCallback((rideId) => {
    if (socket) socket.emit('ride:complete', { rideId });
  }, [socket]);

  const emitCancelRide = useCallback((rideId, reason) => {
    if (socket) socket.emit('ride:cancel', { rideId, reason });
  }, [socket]);

  const emitEnRoute = useCallback((rideId) => {
    if (socket) socket.emit('ride:enRoute', { rideId });
  }, [socket]);

  return {
    emitNewRide,
    emitLocationUpdate,
    emitAcceptRide,
    emitStartRide,
    emitCompleteRide,
    emitCancelRide,
    emitEnRoute,
  };
};