"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      size={"icon"}
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
      aria-label={"Toggle Theme"}
      title="Toggle Theme"
      type="button"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
