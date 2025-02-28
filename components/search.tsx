import { LoaderIcon, SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { getLocation } from "@/lib/search";
import { useDebounce } from "@uidotdev/usehooks";
import { Place } from "@/constants/types";

export default function Search({
  isOpen,
  setIsOpen,
  handleSearch,
  searchQuery,
  setSearchQuery,
  isSearching,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSearch: (e: React.FormEvent) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (isSearching) setIsOpen(false);
  }, [isSearching, setIsOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length >= 3) {
        setIsLoading(true);
        try {
          const data = await getLocation(debouncedSearchQuery);
          if (data.features) {
            setSuggestions(data.features.slice(0, 5));
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else setSuggestions([]);
    };
    fetchSuggestions();
  }, [debouncedSearchQuery]);

  const handleSuggestionSelect = (place: Place) => {
    setSearchQuery(place.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    formRef.current?.requestSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Find your desired place.</DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={handleSearch}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center relative">
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="border-0 bg-foreground text-background rounded-r-none"
            />
            <Button
              className="bg-foreground rounded-l-none"
              type="submit"
              disabled={isSearching}
            >
              {isSearching ? (
                <LoaderIcon size={16} />
              ) : (
                <SearchIcon size={16} />
              )}
            </Button>
          </div>

          {showSuggestions && searchQuery.length >= 3 && (
            <div className="relative w-full">
              <div className="absolute w-full border rounded-md bg-background z-10 max-h-60 overflow-auto">
                {isLoading ? (
                  <div className="p-2 text-center">
                    <LoaderIcon
                      size={16}
                      className="animate-spin inline mr-2"
                    />
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((place, index) => (
                      <li
                        key={index}
                        className="flex justify-between cursor-pointer p-2 hover:bg-muted text-sm"
                        onClick={() => handleSuggestionSelect(place)}
                        title={place.place_name}
                      >
                        <p>
                          {place.place_name.length > 30
                            ? place.place_name.substring(0, 30) + "..."
                            : place.place_name}
                        </p>
                        <p>{`${place.center[1].toFixed(2)}°, ${
                          place.center[1] >= 0 ? "N" : "S"
                        }, ${place.center[0].toFixed(2)}°${
                          place.center[0] >= 0 ? "E" : "W"
                        }
                        `}</p>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.length >= 3 ? (
                  <div className="p-2 text-center text-sm">
                    No results found
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
