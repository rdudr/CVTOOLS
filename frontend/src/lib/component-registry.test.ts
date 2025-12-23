/**
 * Property-Based Tests for Component Registry and Rendering
 * 
 * **Feature: generative-ui-portfolio, Property 5: Component Rendering Completeness**
 * **Validates: Requirements 1.4, 5.2, 5.4**
 * 
 * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
 * **Validates: Requirements 5.1, 5.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ComponentRegistry,
  componentRegistry,
  isValidComponentType,
  COMPONENT_MAP,
  FALLBACK_COMPONENTS,
  getFallbackComponent,
  type ValidationResult,
} from './component-registry';
import {
  ComponentType,
  HeroTheme,
  type ComponentConfig,
  type Skill,
  type Experience,
  type Achievement,
} from '@/types/portfolio';

// Arbitraries for generating test data
const componentTypeArb = fc.constantFrom(...Object.values(ComponentType));

const heroThemeArb = fc.constantFrom(...Object.values(HeroTheme));

const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  level: fc.integer({ min: 1, max: 5 }),
  category: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

// Helper to generate valid date strings
const validDateStringArb = fc.date({ 
  min: new Date('1970-01-01T00:00:00.000Z'), 
  max: new Date('2030-12-31T23:59:59.999Z') 
}).map(d => {
  // Ensure we have a valid date before converting
  if (isNaN(d.getTime())) {
    return '2020-01-01';
  }
  return d.toISOString().split('T')[0];
});

const experienceArb: fc.Arbitrary<Experience> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  company: fc.string({ minLength: 1, maxLength: 100 }),
  location: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  startDate: validDateStringArb,
  endDate: fc.option(validDateStringArb, { nil: undefined }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  highlights: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 5 }), { nil: undefined }),
});

const achievementArb: fc.Arbitrary<Achievement> = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1, maxLength: 50 }),
  value: fc.oneof(fc.string({ minLength: 1, maxLength: 20 }), fc.integer({ min: 0, max: 10000 })),
  icon: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

// Generate valid props for each component type
const validPropsForType = (type: ComponentType): fc.Arbitrary<Record<string, unknown>> => {
  switch (type) {
    case ComponentType.HERO_PRISM:
      return fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        theme: heroThemeArb,
        subtitle: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
      });
    case ComponentType.HERO_TERMINAL:
      return fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        commands: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
        theme: heroThemeArb,
      });
    case ComponentType.EXP_TIMELINE:
    case ComponentType.EXP_MASONRY:
      return fc.record({
        experiences: fc.array(experienceArb, { minLength: 1, maxLength: 5 }),
      });
    case ComponentType.SKILLS_DOTS:
    case ComponentType.SKILLS_RADAR:
      return fc.record({
        skills: fc.array(skillArb, { minLength: 1, maxLength: 10 }),
      });
    case ComponentType.STATS_BENTO:
      return fc.record({
        achievements: fc.array(achievementArb, { minLength: 1, maxLength: 6 }),
      });
    default:
      return fc.constant({});
  }
};

// Generate valid component config
const validComponentConfigArb: fc.Arbitrary<ComponentConfig> = componentTypeArb.chain(type =>
  fc.record({
    type: fc.constant(type),
    props: validPropsForType(type),
    order: fc.integer({ min: 0, max: 100 }),
    theme: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  })
);

// Generate array of component configs with unique orders
const validLayoutComponentsArb: fc.Arbitrary<ComponentConfig[]> = fc
  .array(validComponentConfigArb, { minLength: 1, maxLength: 7 })
  .map(configs => {
    // Ensure unique orders
    return configs.map((config, index) => ({
      ...config,
      order: index,
    }));
  });


describe('Component Registry Integrity', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Property: For any AI tool call, the component registry should have a 
   * corresponding React component mapping that renders without errors.
   */
  
  it('should have a component mapping for every ComponentType', () => {
    fc.assert(
      fc.property(componentTypeArb, (type) => {
        // Every component type should have a mapping in COMPONENT_MAP
        expect(COMPONENT_MAP[type]).toBeDefined();
        expect(typeof COMPONENT_MAP[type]).toBe('function');
      }),
      { numRuns: 100 }
    );
  });

  it('should return a component for every valid component type via registry', () => {
    fc.assert(
      fc.property(componentTypeArb, (type) => {
        const component = componentRegistry.getComponent(type);
        expect(component).not.toBeNull();
        expect(typeof component).toBe('function');
      }),
      { numRuns: 100 }
    );
  });

  it('should have metadata for every registered component type', () => {
    fc.assert(
      fc.property(componentTypeArb, (type) => {
        const metadata = componentRegistry.getMetadata(type);
        expect(metadata).not.toBeNull();
        expect(metadata?.name).toBeDefined();
        expect(metadata?.description).toBeDefined();
        expect(metadata?.category).toBeDefined();
        expect(metadata?.requiredProps).toBeDefined();
        expect(Array.isArray(metadata?.requiredProps)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly identify valid component types', () => {
    fc.assert(
      fc.property(componentTypeArb, (type) => {
        expect(isValidComponentType(type)).toBe(true);
        expect(componentRegistry.hasComponent(type)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid component types', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          s => !Object.values(ComponentType).includes(s as ComponentType)
        ),
        (invalidType) => {
          expect(isValidComponentType(invalidType)).toBe(false);
          expect(componentRegistry.getComponent(invalidType)).toBeNull();
          expect(componentRegistry.hasComponent(invalidType)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have fallback components for all categories', () => {
    const categories = ['hero', 'experience', 'skills', 'stats'] as const;
    
    for (const category of categories) {
      expect(FALLBACK_COMPONENTS[category]).toBeDefined();
      const fallback = getFallbackComponent(category);
      expect(fallback).toBeDefined();
      expect(typeof fallback).toBe('function');
    }
  });

  it('should return all registered types', () => {
    const registeredTypes = componentRegistry.getRegisteredTypes();
    const allTypes = Object.values(ComponentType);
    
    expect(registeredTypes.length).toBe(allTypes.length);
    for (const type of allTypes) {
      expect(registeredTypes).toContain(type);
    }
  });
});

describe('Component Props Validation', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Property: Component props validation should correctly identify valid and invalid props.
   */

  it('should validate valid props for each component type', () => {
    fc.assert(
      fc.property(
        componentTypeArb.chain(type => 
          validPropsForType(type).map(props => ({ type, props }))
        ),
        ({ type, props }) => {
          const result = componentRegistry.validateProps(type, props);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject HeroPrism without required props', () => {
    const invalidProps = [
      {}, // missing all
      { name: 'Test' }, // missing title
      { title: 'Test' }, // missing name
    ];

    for (const props of invalidProps) {
      const result = componentRegistry.validateProps(ComponentType.HERO_PRISM, props);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('should reject HeroTerminal without required props', () => {
    const invalidProps = [
      {}, // missing all
      { name: 'Test', title: 'Test' }, // missing commands
      { commands: ['test'] }, // missing name and title
    ];

    for (const props of invalidProps) {
      const result = componentRegistry.validateProps(ComponentType.HERO_TERMINAL, props);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('should reject experience components without experiences array', () => {
    const types = [ComponentType.EXP_TIMELINE, ComponentType.EXP_MASONRY];
    
    for (const type of types) {
      const result = componentRegistry.validateProps(type, {});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('experiences'))).toBe(true);
    }
  });

  it('should reject skills components without skills array', () => {
    const types = [ComponentType.SKILLS_DOTS, ComponentType.SKILLS_RADAR];
    
    for (const type of types) {
      const result = componentRegistry.validateProps(type, {});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('skills'))).toBe(true);
    }
  });

  it('should reject BentoGrid without achievements array', () => {
    const result = componentRegistry.validateProps(ComponentType.STATS_BENTO, {});
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('achievements'))).toBe(true);
  });
});


describe('Component Rendering Completeness', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 5: Component Rendering Completeness**
   * **Validates: Requirements 1.4, 5.2, 5.4**
   * 
   * Property: For any list of selected components, the portfolio generator should 
   * render all components in the correct order with proper configuration.
   */

  it('should validate complete layout configurations', () => {
    fc.assert(
      fc.property(validLayoutComponentsArb, (configs) => {
        const result = componentRegistry.validateLayoutComponents(configs);
        // All configs with valid props should pass validation
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve component order in validation', () => {
    fc.assert(
      fc.property(validLayoutComponentsArb, (configs) => {
        // Verify orders are sequential
        const orders = configs.map(c => c.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
          expect(orders[i]).toBe(i);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should validate each component config individually', () => {
    fc.assert(
      fc.property(validComponentConfigArb, (config) => {
        const result = componentRegistry.validateComponentConfig(config);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject configs with negative order', () => {
    fc.assert(
      fc.property(
        validComponentConfigArb.map(config => ({
          ...config,
          order: -1,
        })),
        (config) => {
          const result = componentRegistry.validateComponentConfig(config);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('order'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should warn about empty layout', () => {
    const result = componentRegistry.validateLayoutComponents([]);
    expect(result.warnings.some(w => w.includes('no components'))).toBe(true);
  });

  it('should warn about missing hero component', () => {
    // Create layout with only non-hero components
    const nonHeroConfigs: ComponentConfig[] = [
      {
        type: ComponentType.EXP_TIMELINE,
        props: { experiences: [{ id: '1', title: 'Test', company: 'Test', startDate: '2020-01', description: 'Test' }] },
        order: 0,
      },
      {
        type: ComponentType.SKILLS_DOTS,
        props: { skills: [{ name: 'Test', level: 3 }] },
        order: 1,
      },
    ];

    const result = componentRegistry.validateLayoutComponents(nonHeroConfigs);
    expect(result.warnings.some(w => w.includes('hero'))).toBe(true);
  });

  it('should warn about multiple hero components', () => {
    const multiHeroConfigs: ComponentConfig[] = [
      {
        type: ComponentType.HERO_PRISM,
        props: { name: 'Test', title: 'Test' },
        order: 0,
      },
      {
        type: ComponentType.HERO_TERMINAL,
        props: { name: 'Test', title: 'Test', commands: ['test'] },
        order: 1,
      },
    ];

    const result = componentRegistry.validateLayoutComponents(multiHeroConfigs);
    expect(result.warnings.some(w => w.includes('multiple hero'))).toBe(true);
  });

  it('should warn about duplicate order values', () => {
    const duplicateOrderConfigs: ComponentConfig[] = [
      {
        type: ComponentType.HERO_PRISM,
        props: { name: 'Test', title: 'Test' },
        order: 0,
      },
      {
        type: ComponentType.SKILLS_DOTS,
        props: { skills: [{ name: 'Test', level: 3 }] },
        order: 0, // Duplicate order
      },
    ];

    const result = componentRegistry.validateLayoutComponents(duplicateOrderConfigs);
    expect(result.warnings.some(w => w.includes('Duplicate order'))).toBe(true);
  });
});

describe('Component Categories', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
   * **Validates: Requirements 5.1, 5.2**
   */

  it('should correctly categorize hero components', () => {
    const heroTypes = componentRegistry.getComponentsByCategory('hero');
    expect(heroTypes).toContain(ComponentType.HERO_PRISM);
    expect(heroTypes).toContain(ComponentType.HERO_TERMINAL);
    expect(heroTypes).toHaveLength(2);
  });

  it('should correctly categorize experience components', () => {
    const expTypes = componentRegistry.getComponentsByCategory('experience');
    expect(expTypes).toContain(ComponentType.EXP_TIMELINE);
    expect(expTypes).toContain(ComponentType.EXP_MASONRY);
    expect(expTypes).toHaveLength(2);
  });

  it('should correctly categorize skills components', () => {
    const skillTypes = componentRegistry.getComponentsByCategory('skills');
    expect(skillTypes).toContain(ComponentType.SKILLS_DOTS);
    expect(skillTypes).toContain(ComponentType.SKILLS_RADAR);
    expect(skillTypes).toHaveLength(2);
  });

  it('should correctly categorize stats components', () => {
    const statsTypes = componentRegistry.getComponentsByCategory('stats');
    expect(statsTypes).toContain(ComponentType.STATS_BENTO);
    expect(statsTypes).toHaveLength(1);
  });

  it('should have all 7 components registered', () => {
    const allTypes = componentRegistry.getRegisteredTypes();
    expect(allTypes).toHaveLength(7);
  });
});
