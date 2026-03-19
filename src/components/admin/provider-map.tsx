'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProviderMap() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "providers"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProviders(data);
    });

    return () => unsub();
  }, []);

  return (
    <MapContainer
      center={[7.9465, -1.0232]} // Ghana center
      zoom={7}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution='© OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {providers.map((provider) => {
        if (!provider.geo) return null;

        return (
          <Marker
            key={provider.id}
            position={[provider.geo.lat, provider.geo.lng]}
          >
            <Popup>
              <strong>{provider.name}</strong>
              <br />
              Status: {provider.isAvailable ? "Available" : "Busy"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}