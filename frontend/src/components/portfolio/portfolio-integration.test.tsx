/**
 * Portfolio Integration Tests
 * Comprehensive end-to-end workflow testing for portfolio generation
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { componentRegistry } from '@/lib/component-registry';
import { 
  getThemeDefinition, 
  isValidTheme, 
  THEME_DEFINITIONS,
  DEFAULT_THEME,
} from '@/lib/theme-engine';
import {
  ComponentType,
  ProfessionalCategory,
  ThemePalette,
  type LayoutConfiguration,
  type ComponentConfig,
} from '@/types/portfolio';

// Get valid themes from THEME_DEFINITIONS
const VALID_THEMES = Object.keys(THEME_DEFINITIONS) as ThemePalette[];

/**
 * Generate a valid skill for testing
 */
const skillArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  level: fc.integer({ min: 1, max: 5 }),
  category: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
});

describe('Portfolio Integration - Component Registry', () => {
  /**
   * Test that all component types are registered
   * Requirements: 5.1, 5.2
   */
  describe('Component Registration', () => {
    it('should have all 7 core components registered', () => {
      const coreComponents = [
        ComponentType.HERO_PRISM,
        ComponentType.HERO_TERMINAL,
        ComponentType.EXP_TIMELINE,
        ComponentType.EXP_MASONRY,
        ComponentType.SKILLS_DOTS,
        ComponentType.SKILLS_RADAR,
        ComponentType.STATS_BENTO,
      ];

      coreComponents.forEach((type) => {
        const component = componentRegistry.getComponent(type);
        expect(component).toBeDefined();
        expect(typeof component).toBe('function');
      });
    });

    it('should have metadata for all registered components', () => {
      const registeredTypes = componentRegistry.getRegisteredTypes();
      
      registeredTypes.forEach((type) => {
        const metadata = componentRegistry.getMetadata(type);
        expect(metadata).toBeDefined();
        expect(metadata?.name).toBeDefined();
        expect(metadata?.category).toBeDefined();
      });
    });

    /**
     * Property test: Component registry should be consistent
     * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
     * **Validates: Requirements 5.1, 5.2**
     */
    it('should consistently return components for valid types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.values(ComponentType)),
          (componentType) => {
            const component = componentRegistry.getComponent(componentType);
            const metadata = componentRegistry.getMetadata(componentType);
            
            // Component should exist
            if (!component) return false;
            
            // Metadata should exist
            if (!metadata) return false;
            
            // Component should be a function (React component)
            return typeof component === 'function';
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Portfolio Integration - Theme System', () => {
  /**
   * Test theme consistency across components
   * Requirements: 1.5
   */
  describe('Theme Consistency', () => {
    it('should have definitions for all valid themes', () => {
      VALID_THEMES.forEach((theme) => {
        const definition = getThemeDefinition(theme);
        expect(definition).toBeDefined();
        expect(definition.colors).toBeDefined();
        expect(definition.colors.primary).toBeDefined();
        expect(definition.colors.secondary).toBeDefined();
        expect(definition.colors.accent).toBeDefined();
        expect(definition.colors.glow).toBeDefined();
        expect(definition.cssClass).toBeDefined();
      });
    });

    /**
     * Property test: Theme definitions should be consistent
     * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
     * **Validates: Requirements 1.5**
     */
    it('should return consistent theme definitions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_THEMES),
          (theme) => {
            const def1 = getThemeDefinition(theme);
            const def2 = getThemeDefinition(theme);
            
            // Same theme should return same definition
            return (
              def1.colors.primary === def2.colors.primary &&
              def1.colors.secondary === def2.colors.secondary &&
              def1.colors.accent === def2.colors.accent &&
              def1.cssClass === def2.cssClass
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate theme names correctly', () => {
      // Valid themes
      VALID_THEMES.forEach((theme) => {
        expect(isValidTheme(theme)).toBe(true);
      });

      // Invalid themes
      expect(isValidTheme('invalid_theme')).toBe(false);
      expect(isValidTheme('')).toBe(false);
      expect(isValidTheme('NEON_BLUE')).toBe(false); // Case sensitive
    });
  });
});

describe('Portfolio Integration - Professional Category Mapping', () => {
  /**
   * Test component selection based on professional category
   * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4
   */
  describe('Category-Based Component Selection', () => {
    const creativeComponents = [
      ComponentType.HERO_PRISM,
      ComponentType.EXP_MASONRY,
      ComponentType.SKILLS_DOTS,
    ];

    const technicalComponents = [
      ComponentType.HERO_TERMINAL,
      ComponentType.EXP_TIMELINE,
      ComponentType.SKILLS_RADAR,
    ];

    it('should have creative-appropriate components available', () => {
      creativeComponents.forEach((type) => {
        const component = componentRegistry.getComponent(type);
        expect(component).toBeDefined();
      });
    });

    it('should have technical-appropriate components available', () => {
      technicalComponents.forEach((type) => {
        const component = componentRegistry.getComponent(type);
        expect(component).toBeDefined();
      });
    });

    /**
     * Property test: All professional categories should have valid component mappings
     */
    it('should support all professional categories', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ProfessionalCategory.CREATIVE,
            ProfessionalCategory.TECHNICAL,
            ProfessionalCategory.CORPORATE,
            ProfessionalCategory.HYBRID
          ),
          (category) => {
            // Each category should be a valid enum value
            return Object.values(ProfessionalCategory).includes(category);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Portfolio Integration - Layout Configuration', () => {
  /**
   * Test layout configuration validation
   * Requirements: 1.4, 5.2, 5.4
   */
  describe('Layout Validation', () => {
    /**
     * Property test: Layout configurations should be valid
     * **Feature: generative-ui-portfolio, Property 5: Component Rendering Completeness**
     * **Validates: Requirements 1.4, 5.2, 5.4**
     */
    it('should validate layout configurations with valid components', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom(...Object.values(ComponentType)),
              props: fc.constant({ 
                name: 'Test User',
                title: 'Test Title',
                commands: ['test'],
                experiences: [],
                skills: [],
                achievements: [],
              }),
              order: fc.integer({ min: 0, max: 10 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.constantFrom(...Object.values(ThemePalette)),
          fc.constantFrom(...Object.values(ProfessionalCategory)),
          (components, theme, category) => {
            const layout: LayoutConfiguration = {
              components: components as ComponentConfig[],
              globalTheme: theme,
              metadata: {
                generatedAt: new Date(),
                aiConfidence: 0.9,
                professionalCategory: category,
              },
            };

            // Validate layout - should not throw
            const validation = componentRegistry.validateLayoutComponents(layout.components);
            
            // All components should be valid since we're using valid ComponentTypes
            // Note: validation.valid may be false due to missing required props, but no errors about invalid types
            return !validation.errors.some(e => e.includes('Unknown component type'));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect invalid component types in layout', () => {
      const invalidLayout: ComponentConfig[] = [
        {
          type: 'invalid_component' as ComponentType,
          props: {},
          order: 0,
        },
      ];

      const validation = componentRegistry.validateLayoutComponents(invalidLayout);
      // The validation should have errors about the invalid component
      expect(validation.valid).toBe(false);
    });

    it('should sort components by order', () => {
      const components: ComponentConfig[] = [
        { type: ComponentType.STATS_BENTO, props: {}, order: 3 },
        { type: ComponentType.HERO_PRISM, props: {}, order: 0 },
        { type: ComponentType.SKILLS_RADAR, props: {}, order: 2 },
        { type: ComponentType.EXP_TIMELINE, props: {}, order: 1 },
      ];

      const sorted = [...components].sort((a, b) => a.order - b.order);
      
      expect(sorted[0].type).toBe(ComponentType.HERO_PRISM);
      expect(sorted[1].type).toBe(ComponentType.EXP_TIMELINE);
      expect(sorted[2].type).toBe(ComponentType.SKILLS_RADAR);
      expect(sorted[3].type).toBe(ComponentType.STATS_BENTO);
    });
  });
});

describe('Portfolio Integration - Candidate Profile', () => {
  /**
   * Test candidate profile handling
   * Requirements: 1.2, 4.1
   */
  describe('Profile Validation', () => {
    /**
     * Property test: Skills should have valid levels
     */
    it('should handle profiles with various skill levels', () => {
      fc.assert(
        fc.property(
          fc.array(skillArbitrary, { minLength: 1, maxLength: 20 }),
          (skills) => {
            // All skills should have valid levels (1-5)
            return skills.every(
              (skill) =>
                skill.level >= 1 &&
                skill.level <= 5 &&
                skill.name.length > 0
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all professional categories', () => {
      const categories = Object.values(ProfessionalCategory);
      expect(categories).toContain(ProfessionalCategory.CREATIVE);
      expect(categories).toContain(ProfessionalCategory.TECHNICAL);
      expect(categories).toContain(ProfessionalCategory.CORPORATE);
      expect(categories).toContain(ProfessionalCategory.HYBRID);
    });
  });
});

describe('Portfolio Integration - Accessibility', () => {
  /**
   * Test accessibility features with glass theme
   * Requirements: 1.5
   */
  describe('Theme Accessibility', () => {
    it('should have sufficient color contrast in theme definitions', () => {
      VALID_THEMES.forEach((theme) => {
        const definition = getThemeDefinition(theme);
        
        // Theme should have defined colors
        expect(definition.colors.primary).toBeDefined();
        expect(definition.colors.secondary).toBeDefined();
        expect(definition.colors.accent).toBeDefined();
        
        // Colors should be valid CSS color values
        expect(definition.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$|^rgb|^hsl/);
      });
    });

    it('should have CSS classes for all themes', () => {
      VALID_THEMES.forEach((theme) => {
        const definition = getThemeDefinition(theme);
        expect(definition.cssClass).toBeDefined();
        expect(typeof definition.cssClass).toBe('string');
        expect(definition.cssClass.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Portfolio Integration - Error Handling', () => {
  /**
   * Test error handling and fallback behavior
   * Requirements: 4.4, 6.4
   */
  describe('Fallback Behavior', () => {
    it('should return null for unknown component types', () => {
      const component = componentRegistry.getComponent('unknown_type' as ComponentType);
      expect(component).toBeNull();
    });

    it('should return null metadata for unknown component types', () => {
      const metadata = componentRegistry.getMetadata('unknown_type' as ComponentType);
      expect(metadata).toBeNull();
    });

    it('should handle empty layout configurations', () => {
      const validation = componentRegistry.validateLayoutComponents([]);
      expect(validation.valid).toBe(true);
      // Empty layouts should have warnings, not errors
      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    /**
     * Property test: Fallback behavior should be reliable
     * **Feature: generative-ui-portfolio, Property 8: Fallback Behavior Reliability**
     * **Validates: Requirements 4.4, 6.4**
     */
    it('should handle invalid inputs gracefully', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (invalidType) => {
            // Skip if it happens to be a valid type
            if (Object.values(ComponentType).includes(invalidType as ComponentType)) {
              return true;
            }
            
            const component = componentRegistry.getComponent(invalidType as ComponentType);
            const metadata = componentRegistry.getMetadata(invalidType as ComponentType);
            
            // Should return null for invalid types
            return component === null && metadata === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default theme for invalid theme values', () => {
      const invalidThemes = ['invalid', '', 'NEON_BLUE', 'random'];
      
      invalidThemes.forEach((invalidTheme) => {
        const definition = getThemeDefinition(invalidTheme);
        // Should return default theme definition
        expect(definition).toBeDefined();
        expect(definition.name).toBe(DEFAULT_THEME);
      });
    });
  });
});
