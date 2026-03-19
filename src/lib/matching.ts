 import { adminDb } from "./firebase-admin";

/**
 * Calculates the Haversine distance between two points on the Earth.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in kilometers.
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function findNearestProviders(service: string, location: { lat: number, lng: number }) {
  const snapshot = await adminDb
    .collection("providers")
    .where("serviceId", "==", service)
    .where("isOnline", "==", true)
    .where("isAvailable", "==", true)
    .get();

  if (snapshot.empty) {
    return [];
  }

  const providers = snapshot.docs.map(doc => {
    const data = doc.data();
    const distance = getDistance(location.lat, location.lng, data.lat, data.lng);
    return {
      id: doc.id,
      distance,
      ...data
    };
  });

  // Sort by distance and take the top 5
  const sortedProviders = providers.sort((a, b) => a.distance - b.distance);
  
  return sortedProviders.slice(0, 5);
}
