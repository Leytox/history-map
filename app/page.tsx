"use client";
import Map, { MapRef, ProjectionSpecification } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useRef, useCallback } from "react";
import Loader from "@/components/loader";
import StarryBackground from "@/components/starry-background";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@uidotdev/usehooks";
import Overlay from "@/components/overlay";
import { Coordinates } from "@/constants/types";

export default function Home() {
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<Coordinates>({
    latitude: 45,
    longitude: 20,
  });
  const mapRef = useRef<MapRef>(null);
  const { theme } = useTheme();
  const [keyboardShortcutsEnabled] = useLocalStorage<boolean>(
    "keyboard-shortcuts-enabled",
    false
  );
  const [showStars] = useLocalStorage<boolean>("show-stars", false);
  const [projection] = useLocalStorage<
    ProjectionSpecification | "mercator" | "globe" | undefined
  >("projection", "mercator");
  const [loaded, setLoaded] = useState<boolean>(false);

  const onMapLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    setCenter({
      latitude: parseFloat(center.lat.toFixed(3)),
      longitude: parseFloat(center.lng.toFixed(3)),
    });
  }, [mapRef, setCenter]);

  const handleZoomChange = () => {
    if (!mapRef.current) return;
    setZoom(mapRef.current.getZoom());
  };

  return (
    <div className="relative h-screen bg-black">
      {!loaded && (
        <div className="absolute bg-background top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
      {projection === "globe" && showStars && <StarryBackground />}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        maplibreLogo={false}
        attributionControl={false}
        mapStyle={`https://api.maptiler.com/maps/${
          theme === "light"
            ? "64a3a035-a49b-44fa-8501-f8b61522e5a0"
            : "c9c6239f-c58d-43bb-a812-bec6657e56b3"
        }/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
        onLoad={onMapLoad}
        projection={projection}
        minZoom={2}
        onZoom={handleZoomChange}
        onMove={handleMapMove}
        keyboard={keyboardShortcutsEnabled}
      />
      <Overlay
        {...{
          mapRef,
          center,
          zoom,
        }}
      />
    </div>
  );
}
