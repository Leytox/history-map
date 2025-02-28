"use client";
import Map, { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useEffect, useRef, useCallback } from "react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  ExpandIcon,
  GlobeIcon,
  MapIcon,
  ShrinkIcon,
  MapPin,
  MapPinOff,
  GithubIcon,
  LoaderIcon,
  Compass,
  ZoomIn,
  ZoomOut,
  HomeIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import ThemeSwitcher from "@/components/theme-switcher";
import StarryBackground from "@/components/starry-background";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

enum MapTypes {
  light = "64a3a035-a49b-44fa-8501-f8b61522e5a0",
  dark = "c9c6239f-c58d-43bb-a812-bec6657e56b3",
}

export default function Home() {
  const [mapConfig, setMapConfig] = useState({
    loaded: false,
    projection: "mercator" as "mercator" | "globe",
    isFullscreen: false,
  });
  const [locationService, setLocationService] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState(false);
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState({ lat: 45, lng: 20 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const coordsDisplayRef = useRef<HTMLParagraphElement>(null);

  const { theme } = useTheme();

  const onMapLoad = useCallback(() => {
    setMapConfig((prev) => ({ ...prev, loaded: true }));
  }, []);

  const toggleProjection = useCallback(() => {
    setMapConfig((prev) => ({
      ...prev,
      projection: prev.projection === "mercator" ? "globe" : "mercator",
    }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setMapConfig((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setMapConfig((prev) => ({ ...prev, isFullscreen: false }));
      }
    }
  }, []);

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation is not supported by your browser");
      setLocationService(false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 9,
          duration: 2000,
        });
        setLocationService(true);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast(`Unable to retrieve your location: ${error.message}`);
        setLocationService(false);
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    setLocationService(!!navigator.geolocation);
    const handleFullscreenChange = () => {
      setMapConfig((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
      lat: parseFloat(center.lat.toFixed(3)),
      lng: parseFloat(center.lng.toFixed(3)),
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Using MapTiler Geocoding API
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          searchQuery
        )}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 8,
          duration: 2000,
        });
        toast.success(`Found: ${data.features[0].place_name}`);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mapRef.current) return;

      const map = mapRef.current;
      const currentCenter = map.getCenter();
      const zoom = map.getZoom();
      const moveDelta = 50 / Math.pow(2, zoom); // Scale movement with zoom level

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          map.panTo([currentCenter.lng, currentCenter.lat + moveDelta]);
          break;
        case "ArrowDown":
          e.preventDefault();
          map.panTo([currentCenter.lng, currentCenter.lat - moveDelta]);
          break;
        case "ArrowLeft":
          e.preventDefault();
          map.panTo([currentCenter.lng - moveDelta, currentCenter.lat]);
          break;
        case "ArrowRight":
          e.preventDefault();
          map.panTo([currentCenter.lng + moveDelta, currentCenter.lat]);
          break;
        case "+":
          e.preventDefault();
          map.zoomIn();
          break;
        case "-":
          e.preventDefault();
          map.zoomOut();
          break;
        case "g":
          if (e.ctrlKey) {
            e.preventDefault();
            toggleProjection();
          }
          break;
        case "f":
          if (e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "Escape":
          resetView();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleProjection, toggleFullscreen, resetView]);

  return (
    <div className="relative h-screen">
      {!mapConfig.loaded && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
          <Loader />
        </div>
      )}
      {mapConfig.projection === "globe" && <StarryBackground />}
      <div className="absolute z-10 bottom-2 left-1/2 right-1/2 -translate-x-1/2 md:w-72">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground text-background"
          />
          <Button type="submit" size="sm" disabled={isSearching}>
            {isSearching ? <LoaderIcon size={16} /> : <Search size={16} />}
          </Button>
        </form>
      </div>
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
          theme === "light" ? MapTypes.light : MapTypes.dark
        }/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
        onLoad={onMapLoad}
        projection={mapConfig.projection}
        minZoom={2}
        onMouseMove={handleMouseMove}
        onZoom={handleZoomChange}
        onMove={handleMapMove}
      />
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <Button
          onClick={toggleProjection}
          title="Switch projection"
          type="button"
          size={"icon"}
        >
          {mapConfig.projection === "mercator" ? <GlobeIcon /> : <MapIcon />}
        </Button>
        <Button
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
          type="button"
          size={"icon"}
        >
          {mapConfig.isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
        </Button>
        <Button
          onClick={findMyLocation}
          title="Find my location"
          type="button"
          size={"icon"}
          disabled={isLocating}
        >
          {isLocating ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : locationService ? (
            <MapPin />
          ) : (
            <MapPinOff />
          )}
        </Button>
        <a target="_blank" href="https://github.com/Leytox/history-map">
          <Button title="Link to GitHub" type="button" size={"icon"}>
            <GithubIcon />
          </Button>
        </a>
        <ThemeSwitcher />
      </div>

      <Card className="absolute top-2 left-2 bg-foreground items-center text-background min-w-[175px] max-w-[175px] p-1">
        <CardContent className="p-2 flex gap-2 items-center text-xs">
          <Compass size={14} />
          <span>{`${center.lat}°${center.lat >= 0 ? "N" : "S"}, ${center.lng}°${
            center.lng >= 0 ? "E" : "W"
          }`}</span>
        </CardContent>
      </Card>
      <div className="absolute bottom-2 right-2 flex flex-col gap-2">
        <Button
          onClick={handleZoomIn}
          title="Zoom in"
          type="button"
          size={"icon"}
          className="shadow-lg"
        >
          <ZoomIn size={18} />
        </Button>
        <Button
          onClick={handleZoomOut}
          title="Zoom out"
          type="button"
          size={"icon"}
          className="shadow-lg"
        >
          <ZoomOut size={18} />
        </Button>
        <Button
          onClick={resetView}
          title="Reset view"
          type="button"
          size={"icon"}
          className="shadow-lg"
        >
          <HomeIcon size={18} />
        </Button>
      </div>
      <div className="absolute bottom-2 left-2">
        <Card className="py-1 px-3 bg-foreground text-background">
          <p className="text-xs flex gap-1">
            <Search size={16} /> Zoom: {zoom.toFixed(1)}
          </p>
        </Card>
      </div>
    </div>
  );
}
