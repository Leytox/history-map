"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CompassIcon,
  EllipsisIcon,
  InfoIcon,
  StarsIcon,
  ZoomIn,
} from "lucide-react";

export default function SettingsDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] =
    useLocalStorage("keyboard-shortcuts-enabled", true);
  const [showCoordinates, setShowCoordinates] = useLocalStorage(
    "show-coordinates",
    true
  );
  const [showZoomLevel, setShowZoomLevel] = useLocalStorage(
    "show-zoom-level",
    true
  );
  const [showAdditionalButtons, setShowAdditionalButtons] = useLocalStorage(
    "show-additional-buttons",
    true
  );
  const [showStars, setShowStars] = useLocalStorage("show-stars", true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your map experience with these settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="keyboard">Keyboard Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-coordinates">
                <CompassIcon size={16} /> Coordinates
              </Label>
              <Switch
                id="show-coordinates"
                checked={showCoordinates}
                onCheckedChange={setShowCoordinates}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-zoom-level">
                <ZoomIn size={16} />
                Zoom level
              </Label>
              <Switch
                id="show-zoom-level"
                checked={showZoomLevel}
                onCheckedChange={setShowZoomLevel}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-zoom-level">
                <EllipsisIcon size={16} /> Additional buttons
              </Label>
              <Switch
                id="show-zoom-level"
                checked={showAdditionalButtons}
                onCheckedChange={setShowAdditionalButtons}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-stars">
                <StarsIcon size={16} /> Show stars
              </Label>
              <Switch
                id="show-stars"
                checked={showStars}
                onCheckedChange={setShowStars}
              />
            </div>
          </TabsContent>

          <TabsContent value="keyboard" className="space-y-4 mt-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="enable-shortcuts">
                Enable keyboard shortcuts
              </Label>
              <Switch
                id="enable-shortcuts"
                checked={keyboardShortcutsEnabled}
                onCheckedChange={setKeyboardShortcutsEnabled}
              />
            </div>

            <div className="rounded-md border p-4">
              <h4 className="mb-2 font-medium">Available shortcuts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Arrow keys</span>
                  <Badge variant="outline">Move map</Badge>
                </div>
                <div className="flex justify-between">
                  <span>+ / -</span>
                  <Badge variant="outline">Zoom in / out</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Escape</span>
                  <Badge variant="outline">Reset view</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between mt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <InfoIcon className="h-3 w-3 mr-1" />
            <span>Settings are saved in your browser</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
