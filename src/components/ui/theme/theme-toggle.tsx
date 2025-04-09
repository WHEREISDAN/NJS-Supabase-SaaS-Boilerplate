"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";

export function ThemeToggleAdvanced() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {theme === "light" && <Sun className="h-5 w-5" />}
        {theme === "dark" && <Moon className="h-5 w-5" />}
        {theme === "system" && <Monitor className="h-5 w-5" />}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <button onClick={() => setTheme("light")}>
            <Sun className="h-4 w-4 mr-2" />
            Light
          </button>
        </li>
        <li>
          <button onClick={() => setTheme("dark")}>
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </button>
        </li>
        <li>
          <button onClick={() => setTheme("system")}>
            <Monitor className="h-4 w-4 mr-2" />
            System
          </button>
        </li>
      </ul>
    </div>
  );
} 