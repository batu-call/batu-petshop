"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface MapComponentProps {
  position: [number, number];
  isDark?: boolean;
}

export default function MapComponent({ position, isDark = false }: MapComponentProps) {
  return (
    <MapContainer
      center={position}
      zoom={14}
      className="w-full h-full z-0"
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={isDark ? "dark" : "light"}
        attribution={
          isDark
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
        url={
          isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      <Marker position={position}>
        <Popup>
          <div
            style={{
              textAlign: "center",
              padding: "4px 8px",
              background: isDark ? "#1a3d2a" : "#ffffff",
              color: isDark ? "#a8d4b8" : "#1a3d2a",
              borderRadius: "8px",
              minWidth: "120px",
            }}
          >
            <p style={{ fontWeight: "700", fontSize: "14px", margin: "0 0 2px 0" }}>
              Batu Pet Shop
            </p>
            <p style={{ fontSize: "12px", margin: 0, opacity: 0.75 }}>
              We are here 🐾
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}