"use client";
import Map, {
  MapLayerMouseEvent,
  MapRef,
  ProjectionSpecification,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useRef, useCallback } from "react";
import Loader from "@/components/loader";
import { toast } from "sonner";
import StarryBackground from "@/components/starry-background";
import { useTheme } from "next-themes";
import { getGeoDataExternal } from "@/lib/location";
import { getLocation } from "@/lib/search";
import { useLocalStorage } from "@uidotdev/usehooks";
import Overlay from "@/components/overlay";
import { Coordinates } from "@/constants/types";

export default function Home() {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<Coordinates>({
    latitude: 45,
    longitude: 20,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const mapRef = useRef<MapRef>(null);
  const coordsDisplayRef = useRef<HTMLParagraphElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
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

  const showCurrentLocation = async () => {
    setIsLocating(true);
    let latitude, longitude;
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 9,
        duration: 2000,
      });
      toast.success("Location found");
    } catch (error) {
      console.error("Geolocation error:", error);
      toast.error("Unable to use browser location service");
      try {
        const geoData = await getGeoDataExternal();

        mapRef.current?.flyTo({
          center: [geoData.longitude, geoData.latitude],
          zoom: 9,
          duration: 2000,
        });
        toast.success("Location found using external service");
      } catch (fallbackError) {
        console.error("Location error:", fallbackError);
        toast.error("Failed to find location");
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    if (coordsDisplayRef.current) {
      const lat = e.lngLat.lat.toFixed(3);
      const lng = e.lngLat.lng.toFixed(3);
      coordsDisplayRef.current.textContent = `Latitude: ${lat}, Longitude: ${lng}`;
    }
  };

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut();
  };

  const handleZoomChange = () => {
    if (!mapRef.current) return;
    setZoom(mapRef.current.getZoom());
  };

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [20, 45],
      zoom: 4,
      duration: 1000,
    });
  }, []);

  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    setCenter({
      latitude: parseFloat(center.lat.toFixed(3)),
      longitude: parseFloat(center.lng.toFixed(3)),
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const searchRes = await getLocation(searchQuery);
      const [longitude, latitude] = searchRes.features[0].center;
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 8,
        duration: 2000,
      });
      toast.success(`Found: ${searchRes.features[0].place_name}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
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
          longitude: 20,
          latitude: 45,
          zoom: 4,
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
        onMouseMove={handleMouseMove}
        onZoom={handleZoomChange}
        onMove={handleMapMove}
        keyboard={keyboardShortcutsEnabled}
      />
      <Overlay
        {...{
          showCurrentLocation,
          isLocating,
          handleZoomIn,
          handleZoomOut,
          resetView,
          center,
          zoom,
          setIsSettingsOpen,
          isSettingsOpen,
          handleSearch,
          searchQuery,
          setSearchQuery,
          isSearching,
        }}
      />
    </div>
  );
}
