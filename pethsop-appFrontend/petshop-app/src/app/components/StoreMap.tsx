"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function StoreMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const minLat = 24.396308;
    const maxLat = 49.384358;
    const minLng = -124.848974;
    const maxLng = -66.885444;

    setPosition([
      Math.random() * (maxLat - minLat) + minLat,
      Math.random() * (maxLng - minLng) + minLng,
    ]);

    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  if (!position) return null;

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
      <MapContainer
        key="store-map"   
        center={position}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>We are here!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
