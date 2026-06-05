// Default center — Ahmedabad, Gujarat
export const DEFAULT_CENTER = [23.0225, 72.5714];
export const DEFAULT_ZOOM = 13;

// Calculate straight-line distance between two coords (km)
export const getDistanceKm = (coord1, coord2) => {
  const R = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

// Estimate fare from distance
export const estimateFareFromDistance = (distanceKm) => {
  const BASE_FARE = 30;
  const PER_KM = 12;
  return Math.round(BASE_FARE + distanceKm * PER_KM);
};

// Reverse geocode using OpenStreetMap Nominatim (free, no key)
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

// Search locations using Nominatim autocomplete
export const searchLocations = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.map((item) => ({
      address: item.display_name,
      coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
    }));
  } catch {
    return [];
  }
};

// Fetch route between two points using OSRM (free routing engine)
export const fetchRoute = async (pickup, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes[0]) return null;

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      coordinates,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
      distanceText: `${Math.round(route.distance / 1000 * 10) / 10} km`,
      durationText: `${Math.round(route.duration / 60)} min`,
    };
  } catch {
    return null;
  }
};