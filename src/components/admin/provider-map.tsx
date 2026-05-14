'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    <div className="rounded-[32px] overflow-hidden border shadow-sm h-[400px] md:h-[600px] w-full">
        <MapContainer
            center={[7.9465, -1.0232]} // Ghana center
            zoom={7}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
        >
        <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((provider) => {
            if (!provider.geo || !provider.geo.lat || !provider.geo.lng) return null;

            return (
            <Marker
                key={provider.id}
                position={[provider.geo.lat, provider.geo.lng]}
            >
                <Popup>
                <div className="p-1">
                    <strong className="text-primary font-headline block">{provider.name}</strong>
                    <span className="text-xs text-muted-foreground block">{provider.category}</span>
                    <div className="mt-2 flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${provider.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-bold uppercase">{provider.isAvailable ? "Available" : "Busy"}</span>
                    </div>
                </div>
                </Popup>
            </Marker>
            );
        })}
        </MapContainer>
    </div>
  );
}
