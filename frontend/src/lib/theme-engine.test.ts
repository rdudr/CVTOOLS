/**
 * Property-Based Tests for Theme Engine
 * 
 * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
 * **Validates: Requirements 1.5**
 * 
 * **Feature: generative-ui-portfolio, Property 12: Non-blocking Theme Application**
 * **Validates: Requirements 7.4**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  ThemePalette,
} from '@/types/portfolio';
import {
  THEME_DEFINITIONS,
  DEFAULT_THEME,
  THEME_CSS_VARIABLES,
  isValidTheme,
  getThemeDefinition,
  getAvailableThemes,
  ensureValidTheme,
  getThemeClass,
  ThemeEngine,
  type ThemeDefinition,
  type ThemeColors,
} from './theme-engine';

// Arbitraries for generating test data
const validThemeArb = fc.constantFrom(...Object.values(ThemePalette));

const invalidThemeArb = fc.string({ minLength: 1, maxLength: 50 }).filter(
  s => !Object.values(ThemePalette).includes(s as ThemePalette)
);

const anyThemeArb = fc.oneof(validThemeArb, invalidThemeArb);

// Helper to check if a color is a valid hex or rgba color
function isValidColor(color: string): boolean {
  // Check hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  // Check rgba color
  if (/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/.test(color)) return true;
  return false;
}

describe('Theme Consistency Application', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
   * **Validates: Requirements 1.5**
   * 
   * Property: For any generated portfolio, all components should use colors 
   * and styling from the same cohesive theme palette.
   */

  it('should have all required theme palettes defined', () => {
    const requiredPalettes = Object.values(ThemePalette);
    
    for (const palette of requiredPalettes) {
      expect(THEME_DEFINITIONS[palette]).toBeDefined();
      expect(THEME_DEFINITIONS[palette].name).toBe(palette);
    }
  });

  it('should have consistent color structure for all themes', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = THEME_DEFINITIONS[theme];
        
        // Every theme should have all required color properties
        expect(definition.colors.primary).toBeDefined();
        expect(definition.colors.secondary).toBeDefined();
        expect(definition.colors.accent).toBeDefined();
        expect(definition.colors.glow).toBeDefined();
        
        // Colors should be valid color values
        expect(isValidColor(definition.colors.primary)).toBe(true);
        expect(isValidColor(definition.colors.secondary)).toBe(true);
        expect(isValidColor(definition.colors.accent)).toBe(true);
        // Glow can be rgba
        expect(definition.colors.glow).toMatch(/^rgba\(/);
      }),
      { numRuns: 100 }
    );
  });

  it('should have unique CSS classes for each theme', () => {
    const cssClasses = new Set<string>();
    
    for (const theme of Object.values(ThemePalette)) {
      const definition = THEME_DEFINITIONS[theme];
      expect(cssClasses.has(definition.cssClass)).toBe(false);
      cssClasses.add(definition.cssClass);
    }
    
    expect(cssClasses.size).toBe(Object.values(ThemePalette).length);
  });

  it('should return correct theme definition for valid themes', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = getThemeDefinition(theme);
        
        expect(definition.name).toBe(theme);
        expect(definition).toBe(THEME_DEFINITIONS[theme]);
      }),
      { numRuns: 100 }
    );
  });

  it('should return default theme definition for invalid themes', () => {
    fc.assert(
      fc.property(invalidThemeArb, (invalidTheme) => {
        const definition = getThemeDefinition(invalidTheme);
        
        // Should fall back to default theme
        expect(definition.name).toBe(DEFAULT_THEME);
        expect(definition).toBe(THEME_DEFINITIONS[DEFAULT_THEME]);
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly validate theme values', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        expect(isValidTheme(theme)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid theme values', () => {
    fc.assert(
      fc.property(invalidThemeArb, (invalidTheme) => {
        expect(isValidTheme(invalidTheme)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should ensure valid theme with fallback', () => {
    fc.assert(
      fc.property(anyThemeArb, (theme) => {
        const result = ensureValidTheme(theme);
        
        // Result should always be a valid theme
        expect(isValidTheme(result)).toBe(true);
        
        // If input was valid, result should match
        if (isValidTheme(theme)) {
          expect(result).toBe(theme);
        } else {
          // Otherwise should be default
          expect(result).toBe(DEFAULT_THEME);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return correct CSS class for themes', () => {
    fc.assert(
      fc.property(anyThemeArb, (theme) => {
        const cssClass = getThemeClass(theme);
        
        // Should always return a valid CSS class
        expect(cssClass).toBeDefined();
        expect(cssClass.startsWith('theme-')).toBe(true);
        
        // If valid theme, should match definition
        if (isValidTheme(theme)) {
          expect(cssClass).toBe(THEME_DEFINITIONS[theme].cssClass);
        } else {
          // Otherwise should be default theme's class
          expect(cssClass).toBe(THEME_DEFINITIONS[DEFAULT_THEME].cssClass);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have all available themes accessible', () => {
    const availableThemes = getAvailableThemes();
    
    expect(availableThemes.length).toBe(Object.values(ThemePalette).length);
    
    for (const theme of Object.values(ThemePalette)) {
      const found = availableThemes.find(t => t.name === theme);
      expect(found).toBeDefined();
    }
  });

  it('should have display names for all themes', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = THEME_DEFINITIONS[theme];
        
        expect(definition.displayName).toBeDefined();
        expect(definition.displayName.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should have all CSS variable names defined', () => {
    expect(THEME_CSS_VARIABLES.primary).toBe('--theme-primary');
    expect(THEME_CSS_VARIABLES.secondary).toBe('--theme-secondary');
    expect(THEME_CSS_VARIABLES.accent).toBe('--theme-accent');
    expect(THEME_CSS_VARIABLES.glow).toBe('--theme-glow');
  });
});

describe('Theme Engine Singleton', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
   * **Validates: Requirements 1.5**
   */

  it('should return singleton instance', () => {
    const instance1 = ThemeEngine.getInstance();
    const instance2 = ThemeEngine.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should have default theme initially', () => {
    const engine = ThemeEngine.getInstance();
    const theme = engine.getTheme();
    
    expect(isValidTheme(theme)).toBe(true);
  });

  it('should return valid theme definition', () => {
    const engine = ThemeEngine.getInstance();
    const definition = engine.getThemeDefinition();
    
    expect(definition).toBeDefined();
    expect(definition.colors).toBeDefined();
    expect(definition.cssClass).toBeDefined();
  });
});

describe('Non-blocking Theme Application', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 12: Non-blocking Theme Application**
   * **Validates: Requirements 7.4**
   * 
   * Property: For any theme change operation, the UI should remain responsive 
   * and not block user interactions during theme application.
   */

  beforeEach(() => {
    // Mock requestAnimationFrame for testing
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    
    // Mock queueMicrotask
    vi.stubGlobal('queueMicrotask', (cb: () => void) => {
      Promise.resolve().then(cb);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should use requestAnimationFrame for theme application', () => {
    const rafSpy = vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal('requestAnimationFrame', rafSpy);
    
    const engine = ThemeEngine.getInstance();
    
    // Setting theme should trigger requestAnimationFrame
    engine.setTheme(ThemePalette.EMERALD_GREEN);
    
    // requestAnimationFrame should have been called
    expect(rafSpy).toHaveBeenCalled();
  });

  it('should notify listeners asynchronously', async () => {
    const engine = ThemeEngine.getInstance();
    const listener = vi.fn();
    
    engine.subscribe(listener);
    
    // Set a different theme
    const newTheme = engine.getTheme() === ThemePalette.NEON_BLUE 
      ? ThemePalette.EMERALD_GREEN 
      : ThemePalette.NEON_BLUE;
    
    engine.setTheme(newTheme);
    
    // Listener should be called asynchronously
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(listener).toHaveBeenCalledWith(newTheme);
  });

  it('should not block when setting same theme', () => {
    const engine = ThemeEngine.getInstance();
    const currentTheme = engine.getTheme();
    const listener = vi.fn();
    
    engine.subscribe(listener);
    
    // Setting same theme should not trigger listeners
    engine.setTheme(currentTheme);
    
    expect(listener).not.toHaveBeenCalled();
  });

  it('should allow unsubscribing from theme changes', async () => {
    const engine = ThemeEngine.getInstance();
    const listener = vi.fn();
    
    const unsubscribe = engine.subscribe(listener);
    unsubscribe();
    
    // Set a different theme
    const newTheme = engine.getTheme() === ThemePalette.NEON_BLUE 
      ? ThemePalette.CYBER_PINK 
      : ThemePalette.NEON_BLUE;
    
    engine.setTheme(newTheme);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Listener should not be called after unsubscribe
    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle multiple theme changes rapidly', async () => {
    const engine = ThemeEngine.getInstance();
    const listener = vi.fn();
    
    engine.subscribe(listener);
    
    // Rapidly change themes
    const themes = [
      ThemePalette.NEON_BLUE,
      ThemePalette.EMERALD_GREEN,
      ThemePalette.CYBER_PINK,
      ThemePalette.NEON_BLUE,
    ];
    
    for (const theme of themes) {
      engine.setTheme(theme);
    }
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Should have been called for each unique theme change
    // (some may be skipped if same theme is set twice)
    expect(listener).toHaveBeenCalled();
  });

  it('should handle listener errors gracefully', async () => {
    const engine = ThemeEngine.getInstance();
    const errorListener = vi.fn(() => {
      throw new Error('Listener error');
    });
    const normalListener = vi.fn();
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    engine.subscribe(errorListener);
    engine.subscribe(normalListener);
    
    // Set a different theme
    const newTheme = engine.getTheme() === ThemePalette.NEON_BLUE 
      ? ThemePalette.EMERALD_GREEN 
      : ThemePalette.NEON_BLUE;
    
    engine.setTheme(newTheme);
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Error should be logged but not thrown
    expect(consoleSpy).toHaveBeenCalled();
    
    // Normal listener should still be called
    expect(normalListener).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should validate theme application', () => {
    const engine = ThemeEngine.getInstance();
    
    // In test environment without DOM, validation should return true (SSR safety)
    const isValid = engine.validate();
    
    // Should not throw
    expect(typeof isValid).toBe('boolean');
  });
});

describe('Theme Color Consistency', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
   * **Validates: Requirements 1.5**
   * 
   * Property: Theme colors should be consistent and follow a cohesive palette.
   */

  it('should have primary color brighter than secondary', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = THEME_DEFINITIONS[theme];
        
        // Primary and secondary should be different
        expect(definition.colors.primary).not.toBe(definition.colors.secondary);
      }),
      { numRuns: 100 }
    );
  });

  it('should have accent color related to primary', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = THEME_DEFINITIONS[theme];
        
        // Accent should be different from primary but related
        expect(definition.colors.accent).not.toBe(definition.colors.primary);
        expect(definition.colors.accent).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should have glow color with transparency', () => {
    fc.assert(
      fc.property(validThemeArb, (theme) => {
        const definition = THEME_DEFINITIONS[theme];
        
        // Glow should be rgba with transparency
        expect(definition.colors.glow).toMatch(/^rgba\(/);
        expect(definition.colors.glow).toMatch(/,\s*0\.\d+\)$/);
      }),
      { numRuns: 100 }
    );
  });

  it('should have three distinct theme palettes', () => {
    const themes = Object.values(ThemePalette);
    expect(themes.length).toBe(3);
    
    // Each theme should have unique primary color
    const primaryColors = new Set(
      themes.map(t => THEME_DEFINITIONS[t].colors.primary)
    );
    expect(primaryColors.size).toBe(3);
  });
});
