"use client";

/**
 * Theme Context and Provider
 * React context for theme management with non-blocking updates
 * Requirements: 1.5 - Apply a cohesive color palette that matches the candidate's professional style
 * Requirements: 7.4 - Apply styling without blocking user interactions
 */

import * as React from "react";
import {
  ThemePalette,
} from "@/types/portfolio";
import {
  themeEngine,
  getThemeDefinition,
  DEFAULT_THEME,
  isValidTheme,
  type ThemeDefinition,
  type ThemeColors,
} from "./theme-engine";

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  /** Current theme palette */
  theme: ThemePalette;
  /** Current theme definition with colors */
  themeDefinition: ThemeDefinition;
  /** Set theme - non-blocking operation */
  setTheme: (theme: ThemePalette) => void;
  /** Check if theme is valid */
  isValidTheme: (theme: unknown) => theme is ThemePalette;
  /** Get theme colors */
  colors: ThemeColors;
}

/**
 * Theme context
 */
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme to apply */
  initialTheme?: ThemePalette;
  /** Callback when theme changes */
  onThemeChange?: (theme: ThemePalette) => void;
}

/**
 * Theme Provider Component
 * Provides theme context to child components with non-blocking updates
 */
export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
  onThemeChange,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemePalette>(initialTheme);
  const [themeDefinition, setThemeDefinition] = React.useState<ThemeDefinition>(
    getThemeDefinition(initialTheme)
  );

  // Initialize theme engine on mount
  React.useEffect(() => {
    themeEngine.initialize();
    
    // Set initial theme
    themeEngine.setTheme(initialTheme);
    
    // Subscribe to theme changes
    const unsubscribe = themeEngine.subscribe((newTheme) => {
      setThemeState(newTheme);
      setThemeDefinition(getThemeDefinition(newTheme));
      onThemeChange?.(newTheme);
    });
    
    return unsubscribe;
  }, [initialTheme, onThemeChange]);

  // Non-blocking theme setter
  const setTheme = React.useCallback((newTheme: ThemePalette) => {
    // Use startTransition for non-blocking update
    React.startTransition(() => {
      themeEngine.setTheme(newTheme);
    });
  }, []);

  // Memoized context value
  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeDefinition,
      setTheme,
      isValidTheme,
      colors: themeDefinition.colors,
    }),
    [theme, themeDefinition, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Throws if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}

/**
 * Hook to access theme context safely (returns null if outside provider)
 */
export function useThemeSafe(): ThemeContextValue | null {
  return React.useContext(ThemeContext);
}

/**
 * Hook to get current theme colors
 * Can be used outside ThemeProvider (returns default colors)
 */
export function useThemeColors(): ThemeColors {
  const context = React.useContext(ThemeContext);
  
  if (context) {
    return context.colors;
  }
  
  // Fallback to default theme colors
  return getThemeDefinition(DEFAULT_THEME).colors;
}

/**
 * Hook to get validated theme with fallback
 * Ensures components always have a valid theme
 */
export function useValidatedTheme(themeProp?: string): {
  theme: ThemePalette;
  colors: ThemeColors;
  cssClass: string;
} {
  const context = React.useContext(ThemeContext);
  
  // Use prop if valid, otherwise use context theme, otherwise use default
  const validTheme = React.useMemo(() => {
    if (themeProp && isValidTheme(themeProp)) {
      return themeProp;
    }
    if (context?.theme) {
      return context.theme;
    }
    return DEFAULT_THEME;
  }, [themeProp, context?.theme]);
  
  const definition = getThemeDefinition(validTheme);
  
  return {
    theme: validTheme,
    colors: definition.colors,
    cssClass: definition.cssClass,
  };
}

/**
 * Hook to ensure theme CSS variables are applied to a component
 * Returns style object with theme CSS variables for inline application
 */
export function useThemeStyle(): React.CSSProperties {
  const { colors } = useThemeColors();
  
  return React.useMemo(() => ({
    "--theme-primary": colors.primary,
    "--theme-secondary": colors.secondary,
    "--theme-accent": colors.accent,
    "--theme-glow": colors.glow,
  } as React.CSSProperties), [colors]);
}
