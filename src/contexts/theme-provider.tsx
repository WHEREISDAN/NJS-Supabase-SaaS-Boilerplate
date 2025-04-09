"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const initialState: ThemeContextType = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const updateResolvedTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const resolved = theme === "system" ? systemTheme : theme;
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const listener = () => updateResolvedTheme();
    mediaQuery.addEventListener("change", listener);
    
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}; 