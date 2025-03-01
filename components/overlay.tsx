import {
  Compass,
  GlobeIcon,
  HomeIcon,
  InfoIcon,
  LoaderIcon,
  MapIcon,
  MapPin,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "./ui/button";
import ThemeSwitcher from "./theme-switcher";
import SettingsDialog from "./settings";
import { Card, CardContent } from "./ui/card";
import { useLocalStorage, useWindowSize } from "@uidotdev/usehooks";
import { useCallback, useState } from "react";
import Search from "./search";
import { ProjectionSpecification } from "maplibre-gl";
import { Coordinates } from "@/constants/types";
import { getGeoDataExternal } from "@/lib/location";
import { getLocation } from "@/lib/search";
import { toast } from "sonner";
import { MapRef } from "react-map-gl/maplibre";
export default function Overlay({
  mapRef,
  center,
  zoom,
}: {
  mapRef: React.RefObject<MapRef | null>;
  center: Coordinates;
  zoom: number;
}) {
  const [showCoordinates] = useLocalStorage<boolean>("show-coordinates", true);
  const [showZoomLevel] = useLocalStorage<boolean>("show-zoom-level", true);
  const [showAdditionalButtons] = useLocalStorage<boolean>(
    "show-additional-buttons",
    true
  );
  const [projection, setProjection] = useLocalStorage<
    ProjectionSpecification | "mercator" | "globe" | undefined
  >("projection", "mercator");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [menuShown, setMenuShown] = useState<boolean>(false);
  const size = useWindowSize();
  const showCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 9,
        duration: 2000,
      });
      toast.success("Location found");
    } catch (error) {
      console.error("Geolocation error:", error);
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

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [20, 45],
      zoom: 4,
      duration: 1000,
    });
  }, [mapRef]);

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
    <>
      {size.width! <= 768 && !menuShown ? (
        <Button
          className="absolute top-2 right-2"
          type="button"
          onClick={() => setMenuShown(true)}
          title="Expand Menu"
          size={"icon"}
        >
          <MenuIcon size={16} />
        </Button>
      ) : (
        <>
          {isSearchOpen && (
            <Search
              isOpen={isSearchOpen}
              setIsOpen={setIsSearchOpen}
              handleSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
            />
          )}
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
            <ThemeSwitcher />
            <Button
              onClick={showCurrentLocation}
              title="Find my location"
              type="button"
              size={"icon"}
              disabled={isLocating}
            >
              {isLocating ? (
                <LoaderIcon size={16} className="animate-spin" />
              ) : (
                <MapPin />
              )}
            </Button>
            <Button
              size="icon"
              title="Search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon />
            </Button>
            <Button
              size="icon"
              title="Settings"
              type="button"
              onClick={() => setIsSettingsOpen(true)}
            >
              <SettingsIcon />
            </Button>
            <a target="_blank" href="https://github.com/Leytox/history-map">
              <Button
                title="This project on Github"
                type="button"
                size={"icon"}
              >
                <InfoIcon />
              </Button>
            </a>

            {showAdditionalButtons && (
              <div className={"left-2 flex flex-col gap-2"}>
                <Button
                  onClick={resetView}
                  title="Reset view"
                  type="button"
                  size={"icon"}
                  className="shadow-lg"
                >
                  <HomeIcon size={18} />
                </Button>
                <Button
                  onClick={() => mapRef?.current?.zoomIn()}
                  title="Zoom in"
                  type="button"
                  size={"icon"}
                  className="shadow-lg"
                >
                  <ZoomIn size={18} />
                </Button>
                <Button
                  onClick={() => mapRef?.current?.zoomOut()}
                  title="Zoom out"
                  type="button"
                  size={"icon"}
                  className="shadow-lg"
                >
                  <ZoomOut size={18} />
                </Button>
              </div>
            )}

            {showZoomLevel && (
              <Card className="border-0 py-1 px-2.5 bg-foreground text-background">
                <p className="text-xs">{zoom.toFixed(1)}</p>
              </Card>
            )}
            {menuShown && size.width! <= 768 && (
              <Button
                type="button"
                onClick={() => setMenuShown(false)}
                title="Expand Menu"
                size={"icon"}
              >
                <XIcon size={16} />
              </Button>
            )}
          </div>
        </>
      )}

      {showCoordinates && (
        <Card className="border-0 absolute top-2 left-2 bg-foreground items-center text-background min-w-[160px] max-w-[160px] p-1">
          <CardContent className="p-2 flex gap-2 items-center text-xs">
            <Compass size={14} />
            <span>{`${center.latitude.toFixed(2)}°${
              center.latitude >= 0 ? "N" : "S"
            }, ${center.longitude.toFixed(2)}°${
              center.longitude >= 0 ? "E" : "W"
            }`}</span>
          </CardContent>
        </Card>
      )}
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  );
}
