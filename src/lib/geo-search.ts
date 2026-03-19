
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { adminDb } from "@/lib/firebase-admin";

export async function findNearbyProviders(lat: number, lng: number, serviceId: string) {

  const radiusInM = 10 * 1000; // 10km radius

  // Get the geohash query bounds
  const bounds = geohashQueryBounds([lat, lng], radiusInM);

  // Construct the parallel queries
  const promises = bounds.map(b =>
    adminDb.collection("providers")
      .orderBy("geohash")
      .startAt(b[0])
      .endAt(b[1])
      .get()
  );

  const snapshots = await Promise.all(promises);

  const matchingProviders: any[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const provider = doc.data();

      // Filter out providers who don't offer the requested service or are unavailable
      if (provider.serviceId !== serviceId || !provider.isAvailable || !provider.geo) {
          continue;
      }

      // Calculate the precise distance between the provider and the customer
      const distanceInKm = distanceBetween([lat, lng], [provider.geo.lat, provider.geo.lng]);
      const distanceInM = distanceInKm * 1000;

      // Add the provider to the list if they are within the radius
      if (distanceInM <= radiusInM) {
        matchingProviders.push({
          id: doc.id,
          ...provider,
          distance: distanceInM
        });
      }
    }
  }

  // Sort the final list of providers by distance
  return matchingProviders.sort((a, b) => a.distance - b.distance);
}
