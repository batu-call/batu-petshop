"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const DEFAULT_POSITION: [number, number] = [37.7749, -122.4194];

const MapComponent = dynamic(
  () => import("./MapComponent").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#1a3d2a] rounded-3xl">
        <p className="text-gray-400 dark:text-[#7aab8a] animate-pulse">Loading map...</p>
      </div>
    ),
  }
);

interface StoreMapProps {
  lat?: number;
  lng?: number;
}

const StoreMap = ({ lat, lng }: StoreMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark]   = useState(false);

  const position: [number, number] =
    lat && lng ? [lat, lng] : DEFAULT_POSITION;

  useEffect(() => {
    setMounted(true);

    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#1a3d2a] rounded-3xl">
        <p className="text-gray-400 dark:text-[#7aab8a] animate-pulse">Loading map...</p>
      </div>
    );
  }

  return <MapComponent position={position} isDark={isDark} />;
};

export default StoreMap;