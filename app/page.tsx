"use client";
import Map, { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import ThemeSwitcher from "@/components/theme-switcher";
import StarryBackground from "@/components/starry-background";
import { useTheme } from "next-themes";

enum MapTypes {
  light = "64a3a035-a49b-44fa-8501-f8b61522e5a0",
  dark = "c9c6239f-c58d-43bb-a812-bec6657e56b3",
}

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [projection, setProjection] = useState<"mercator" | "globe">(
    "mercator"
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mapRef = useRef<MapRef>(null);
  const coordsDisplayRef = useRef<HTMLParagraphElement>(null);
  const [locationService, setLocationService] = useState<boolean>(
    !!navigator.geolocation
  );

  const { theme } = useTheme();

  const onMapLoad = () => {
    setMapLoaded(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const findMyLocation = () => {
    if (locationService) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 9,
            duration: 2000,
          });
          setLocationService(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast(
            "Unable to retrieve your location. Please check your browser permissions."
          );
          setLocationService(false);
        }
      );
    } else {
      toast(
        "Geolocation is not supported by your browser, try to restart page or use another browser."
      );
    }
  };

  useEffect(() => {
    setLocationService(!!navigator.geolocation);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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

  return (
    <div className="relative h-screen">
      {!mapLoaded && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
          <Loader />
        </div>
      )}
      {projection === "globe" && <StarryBackground />}
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
        projection={projection}
        minZoom={2}
        onMouseMove={handleMouseMove}
      />
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <Button
          onClick={() =>
            setProjection(projection === "mercator" ? "globe" : "mercator")
          }
          title="Switch projection"
          type="button"
          size={"icon"}
        >
          {projection === "mercator" ? <GlobeIcon /> : <MapIcon />}
        </Button>
        <Button
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
          type="button"
          size={"icon"}
        >
          {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
        </Button>
        <Button
          onClick={findMyLocation}
          title="Find my location"
          type="button"
          size={"icon"}
        >
          {locationService ? <MapPin /> : <MapPinOff />}
        </Button>
        <a target="_blank" href="https://github.com/Leytox/history-map">
          <Button title="Link to GitHub" type="button" size={"icon"}>
            <GithubIcon />
          </Button>
        </a>
        <ThemeSwitcher />
      </div>
      <Card className="absolute top-2 left-2">
        <CardContent ref={coordsDisplayRef}>
          Latitude: 0.0000, Longitude: 0.0000
        </CardContent>
      </Card>
    </div>
  );
}
