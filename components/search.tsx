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
import { useEffect } from "react";

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
  useEffect(() => {
    if (isSearching) setIsOpen(false);
  }, [isSearching, setIsOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Find your desired place.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex items-center">
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-foreground text-background  rounded-r-none"
          />
          <Button
            className="bg-foreground rounded-l-none"
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? <LoaderIcon size={16} /> : <SearchIcon size={16} />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
