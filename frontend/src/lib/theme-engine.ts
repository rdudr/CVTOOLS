/**
 * Theme Engine
 * Dynamic theme system with CSS variables for runtime theme switching
 * Requirements: 1.5 - Apply a cohesive color palette that matches the candidate's professional style
 * 
 * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
 */

import type * as React from "react";
import { ThemePalette } from "@/types/portfolio";

/**
 * Theme color configuration
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

/**
 * Complete theme definition
 */
export interface ThemeDefinition {
  name: ThemePalette;
  displayName: string;
  colors: ThemeColors;
  cssClass: string;
}

/**
 * Theme definitions for all supported palettes
 */
export const THEME_DEFINITIONS: Record<ThemePalette, ThemeDefinition> = {
  [ThemePalette.NEON_BLUE]: {
    name: ThemePalette.NEON_BLUE,
    displayName: "Neon Blue",
    colors: {
      primary: "#00d4ff",
      secondary: "#0099cc",
      accent: "#66e0ff",
      glow: "rgba(0, 212, 255, 0.3)",
    },
    cssClass: "theme-neon-blue",
  },
  [ThemePalette.EMERALD_GREEN]: {
    name: ThemePalette.EMERALD_GREEN,
    displayName: "Emerald Green",
    colors: {
      primary: "#00ff88",
      secondary: "#00cc6a",
      accent: "#66ffaa",
      glow: "rgba(0, 255, 136, 0.3)",
    },
    cssClass: "theme-emerald-green",
  },
  [ThemePalette.CYBER_PINK]: {
    name: ThemePalette.CYBER_PINK,
    displayName: "Cyber Pink",
    colors: {
      primary: "#ff0080",
      secondary: "#cc0066",
      accent: "#ff66b3",
      glow: "rgba(255, 0, 128, 0.3)",
    },
    cssClass: "theme-cyber-pink",
  },
};

/**
 * Default theme to use when no theme is specified or validation fails
 */
export const DEFAULT_THEME = ThemePalette.NEON_BLUE;

/**
 * CSS variable names used by the theme system
 */
export const THEME_CSS_VARIABLES = {
  primary: "--theme-primary",
  secondary: "--theme-secondary",
  accent: "--theme-accent",
  glow: "--theme-glow",
} as const;

/**
 * Type guard to check if a value is a valid ThemePalette
 */
export function isValidTheme(theme: unknown): theme is ThemePalette {
  return (
    typeof theme === "string" &&
    Object.values(ThemePalette).includes(theme as ThemePalette)
  );
}

/**
 * Get theme definition by palette name
 * Returns default theme if invalid palette is provided
 */
export function getThemeDefinition(theme: ThemePalette | string): ThemeDefinition {
  if (isValidTheme(theme)) {
    return THEME_DEFINITIONS[theme];
  }
  console.warn(`Invalid theme "${theme}", falling back to default`);
  return THEME_DEFINITIONS[DEFAULT_THEME];
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): ThemeDefinition[] {
  return Object.values(THEME_DEFINITIONS);
}

/**
 * Apply theme CSS variables to a DOM element
 * Non-blocking - uses requestAnimationFrame for smooth application
 */
export function applyThemeToElement(
  element: HTMLElement,
  theme: ThemePalette | string
): void {
  const definition = getThemeDefinition(theme);
  
  // Use requestAnimationFrame for non-blocking application
  requestAnimationFrame(() => {
    element.style.setProperty(THEME_CSS_VARIABLES.primary, definition.colors.primary);
    element.style.setProperty(THEME_CSS_VARIABLES.secondary, definition.colors.secondary);
    element.style.setProperty(THEME_CSS_VARIABLES.accent, definition.colors.accent);
    element.style.setProperty(THEME_CSS_VARIABLES.glow, definition.colors.glow);
  });
}

/**
 * Apply theme to document root (global theme)
 * Non-blocking - uses requestAnimationFrame for smooth application
 */
export function applyGlobalTheme(theme: ThemePalette | string): void {
  if (typeof document === "undefined") {
    return; // SSR safety
  }
  
  const definition = getThemeDefinition(theme);
  
  // Use requestAnimationFrame for non-blocking application
  requestAnimationFrame(() => {
    const root = document.documentElement;
    
    // Remove all theme classes first
    Object.values(THEME_DEFINITIONS).forEach((def) => {
      root.classList.remove(def.cssClass);
    });
    
    // Add new theme class
    root.classList.add(definition.cssClass);
    
    // Also set CSS variables directly for immediate effect
    root.style.setProperty(THEME_CSS_VARIABLES.primary, definition.colors.primary);
    root.style.setProperty(THEME_CSS_VARIABLES.secondary, definition.colors.secondary);
    root.style.setProperty(THEME_CSS_VARIABLES.accent, definition.colors.accent);
    root.style.setProperty(THEME_CSS_VARIABLES.glow, definition.colors.glow);
  });
}

/**
 * Get current theme from document root
 */
export function getCurrentTheme(): ThemePalette {
  if (typeof document === "undefined") {
    return DEFAULT_THEME; // SSR safety
  }
  
  const root = document.documentElement;
  
  for (const [palette, definition] of Object.entries(THEME_DEFINITIONS)) {
    if (root.classList.contains(definition.cssClass)) {
      return palette as ThemePalette;
    }
  }
  
  return DEFAULT_THEME;
}

/**
 * Validate that all theme CSS variables are properly set
 */
export function validateThemeApplication(element?: HTMLElement): boolean {
  if (typeof document === "undefined") {
    return true; // SSR safety - assume valid
  }
  
  const target = element || document.documentElement;
  const computedStyle = getComputedStyle(target);
  
  const requiredVariables = Object.values(THEME_CSS_VARIABLES);
  
  for (const variable of requiredVariables) {
    const value = computedStyle.getPropertyValue(variable).trim();
    if (!value) {
      console.warn(`Theme variable ${variable} is not set`);
      return false;
    }
  }
  
  return true;
}

/**
 * Get theme colors from computed styles
 * Useful for components that need programmatic access to theme colors
 */
export function getComputedThemeColors(element?: HTMLElement): ThemeColors {
  if (typeof document === "undefined") {
    // SSR fallback - return default theme colors
    return THEME_DEFINITIONS[DEFAULT_THEME].colors;
  }
  
  const target = element || document.documentElement;
  const computedStyle = getComputedStyle(target);
  
  return {
    primary: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.primary).trim() || 
             THEME_DEFINITIONS[DEFAULT_THEME].colors.primary,
    secondary: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.secondary).trim() || 
               THEME_DEFINITIONS[DEFAULT_THEME].colors.secondary,
    accent: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.accent).trim() || 
            THEME_DEFINITIONS[DEFAULT_THEME].colors.accent,
    glow: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.glow).trim() || 
          THEME_DEFINITIONS[DEFAULT_THEME].colors.glow,
  };
}

/**
 * ThemeEngine class for managing theme state
 */
export class ThemeEngine {
  private static instance: ThemeEngine;
  private currentTheme: ThemePalette;
  private listeners: Set<(theme: ThemePalette) => void>;

  private constructor() {
    this.currentTheme = DEFAULT_THEME;
    this.listeners = new Set();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ThemeEngine {
    if (!ThemeEngine.instance) {
      ThemeEngine.instance = new ThemeEngine();
    }
    return ThemeEngine.instance;
  }

  /**
   * Get current theme
   */
  public getTheme(): ThemePalette {
    return this.currentTheme;
  }

  /**
   * Get theme definition for current theme
   */
  public getThemeDefinition(): ThemeDefinition {
    return THEME_DEFINITIONS[this.currentTheme];
  }

  /**
   * Set theme and apply to document
   * Non-blocking operation
   */
  public setTheme(theme: ThemePalette | string): void {
    const validTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
    
    if (validTheme === this.currentTheme) {
      return; // No change needed
    }
    
    this.currentTheme = validTheme;
    applyGlobalTheme(validTheme);
    
    // Notify listeners asynchronously to avoid blocking
    queueMicrotask(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(validTheme);
        } catch (error) {
          console.error("Theme listener error:", error);
        }
      });
    });
  }

  /**
   * Subscribe to theme changes
   * Returns unsubscribe function
   */
  public subscribe(listener: (theme: ThemePalette) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Initialize theme from document or apply default
   */
  public initialize(): void {
    if (typeof document === "undefined") {
      return; // SSR safety
    }
    
    const currentFromDOM = getCurrentTheme();
    this.currentTheme = currentFromDOM;
    
    // Ensure CSS variables are set
    applyGlobalTheme(this.currentTheme);
  }

  /**
   * Validate current theme application
   */
  public validate(): boolean {
    return validateThemeApplication();
  }
}

// Export singleton instance
export const themeEngine = ThemeEngine.getInstance();

/**
 * Utility to ensure theme is applied with fallback
 * Returns the validated theme or default
 */
export function ensureValidTheme(theme: unknown): ThemePalette {
  if (isValidTheme(theme)) {
    return theme;
  }
  return DEFAULT_THEME;
}

/**
 * Get CSS class for a theme with fallback
 */
export function getThemeClass(theme: unknown): string {
  const validTheme = ensureValidTheme(theme);
  return THEME_DEFINITIONS[validTheme].cssClass;
}

/**
 * Check if all required theme CSS variables are defined
 * Useful for debugging theme issues
 */
export function debugThemeVariables(element?: HTMLElement): Record<string, string | null> {
  if (typeof document === "undefined") {
    return {};
  }
  
  const target = element || document.documentElement;
  const computedStyle = getComputedStyle(target);
  
  return {
    primary: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.primary).trim() || null,
    secondary: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.secondary).trim() || null,
    accent: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.accent).trim() || null,
    glow: computedStyle.getPropertyValue(THEME_CSS_VARIABLES.glow).trim() || null,
  };
}

/**
 * Get theme-aware style object for inline styles
 * Ensures components use consistent theme colors with fallbacks
 */
export function getThemeStyles(theme?: ThemePalette | string): React.CSSProperties {
  const definition = getThemeDefinition(theme || DEFAULT_THEME);
  return {
    [THEME_CSS_VARIABLES.primary]: definition.colors.primary,
    [THEME_CSS_VARIABLES.secondary]: definition.colors.secondary,
    [THEME_CSS_VARIABLES.accent]: definition.colors.accent,
    [THEME_CSS_VARIABLES.glow]: definition.colors.glow,
  } as React.CSSProperties;
}

/**
 * Validate and normalize a theme prop value
 * Returns the validated theme or default if invalid
 */
export function validateThemeProp(theme: unknown): ThemePalette {
  if (isValidTheme(theme)) {
    return theme;
  }
  if (typeof theme === "string" && theme.length > 0) {
    console.warn(`Invalid theme prop "${theme}", using default theme`);
  }
  return DEFAULT_THEME;
}

/**
 * Create CSS variable references for use in component styles
 * Returns an object with CSS var() references
 */
export const themeVars = {
  primary: `var(${THEME_CSS_VARIABLES.primary})`,
  secondary: `var(${THEME_CSS_VARIABLES.secondary})`,
  accent: `var(${THEME_CSS_VARIABLES.accent})`,
  glow: `var(${THEME_CSS_VARIABLES.glow})`,
} as const;

/**
 * Merge component-specific theme overrides with global theme
 * Useful for components that need local theme variations
 */
export function mergeThemeOverrides(
  baseTheme: ThemePalette | string,
  overrides?: Partial<ThemeColors>
): ThemeColors {
  const definition = getThemeDefinition(baseTheme);
  return {
    ...definition.colors,
    ...overrides,
  };
}
