import {
  Compass,
  GithubIcon,
  GlobeIcon,
  HomeIcon,
  LoaderIcon,
  MapIcon,
  MapPin,
  SearchIcon,
  SettingsIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "./ui/button";
import ThemeSwitcher from "./theme-switcher";
import SettingsDialog from "./settings";
import { Card, CardContent } from "./ui/card";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import Search from "./search";
import { ProjectionSpecification } from "maplibre-gl";
import { Coordinates } from "@/constants/types";
export default function Overlay({
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
}: {
  showCurrentLocation: () => void;
  isLocating: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  resetView: () => void;
  center: Coordinates;
  zoom: number;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isSettingsOpen: boolean;
  handleSearch: (e: React.FormEvent) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
}) {
  const [showCoordinates] = useLocalStorage<boolean>("show-coordinates", true);
  const [showZoomLevel] = useLocalStorage<boolean>("show-zoom-level", true);
  const [showAdditionalButtons] = useLocalStorage<boolean>(
    "show-additional-buttons",
    true
  );
  const [projection, setProjection] = useLocalStorage<
    ProjectionSpecification["type"]
  >("projection", "mercator");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  return (
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
          <Button title="This project on Github" type="button" size={"icon"}>
            <GithubIcon />
          </Button>
        </a>
      </div>

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

      {showAdditionalButtons && (
        <div
          className={`absolute ${
            showZoomLevel ? "bottom-10" : "bottom-2"
          } left-2 flex flex-col gap-2`}
        >
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
        </div>
      )}

      {showZoomLevel && (
        <div className="absolute bottom-2 left-2" title="Zoom level">
          <Card className="border-0 py-1 px-2.5 bg-foreground text-background">
            <p className="text-xs">{zoom.toFixed(1)}</p>
          </Card>
        </div>
      )}
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  );
}
