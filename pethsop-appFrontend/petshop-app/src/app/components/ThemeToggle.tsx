"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative cursor-pointer w-9 h-9 transition duration-300 hover:scale-[1.05] active:scale-[0.97]
                 hover:bg-[#D6EED6]/50 dark:hover:bg-white/10 rounded-full"
      aria-label="Toggle theme"
    >
      <Sun
        size={18}
        className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-color"
      />
      <Moon
        size={18}
        className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-color"
      />
    </Button>
  );
}