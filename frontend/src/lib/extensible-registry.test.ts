/**
 * Property-Based Tests for System Extensibility
 * 
 * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
 * **Validates: Requirements 5.3**
 * 
 * Property: For any addition of new components to the toolbox, existing component
 * rendering and selection logic should continue to function correctly.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ComponentType } from "@/types/portfolio";
import {
  ExtensibleComponentRegistry,
  extensibleRegistry,
} from "./extensible-registry";
import {
  PluginManager,
  type ExtendedComponentPlugin,
  type ComponentPlugin,
  createPropsValidator,
} from "./component-plugin-system";
import { ComponentConfigManager } from "./component-config-manager";
import type { ComponentMetadata, ValidationResult } from "./component-registry";

// Mock React component for testing
const MockComponent = () => null;

// Arbitrary for generating valid plugin IDs
const pluginIdArb = fc
  .string({ minLength: 5, maxLength: 30 })
  .filter((s) => /^[a-z_][a-z0-9_]*$/.test(s))
  .map((s) => `tool_custom_${s}`);

// Arbitrary for component categories
const categoryArb = fc.constantFrom("hero", "experience", "skills", "stats");

// Arbitrary for generating valid component metadata
const metadataArb = (category: string): fc.Arbitrary<ComponentMetadata> =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    category: fc.constant(category as ComponentMetadata["category"]),
    requiredProps: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
      minLength: 0,
      maxLength: 5,
    }),
    optionalProps: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
      minLength: 0,
      maxLength: 5,
    }),
  });

// Arbitrary for generating valid plugins
const pluginArb: fc.Arbitrary<ExtendedComponentPlugin> = fc
  .tuple(pluginIdArb, categoryArb)
  .chain(([id, category]) =>
    metadataArb(category).map((metadata) => ({
      id,
      component: MockComponent,
      metadata,
      validateProps: () => ({ valid: true, errors: [], warnings: [] }),
    }))
  );

// Arbitrary for generating multiple unique plugins
const uniquePluginsArb = (count: number): fc.Arbitrary<ExtendedComponentPlugin[]> =>
  fc
    .array(pluginArb, { minLength: count, maxLength: count })
    .map((plugins) => {
      // Ensure unique IDs
      const seen = new Set<string>();
      return plugins.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    });

describe("System Extensibility Preservation", () => {
  /**
   * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
   * **Validates: Requirements 5.3**
   */

  beforeEach(() => {
    // Reset all singletons before each test
    ExtensibleComponentRegistry.resetInstance();
  });

  it("should preserve all core components after registering new plugins", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        // Reset registry
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Get core components before registration
        const coreTypesBefore = Object.values(ComponentType);
        const coreCountBefore = coreTypesBefore.length;

        // Register the plugin
        registry.registerComponent(plugin);

        // Verify all core components still exist
        for (const coreType of coreTypesBefore) {
          const lookup = registry.getComponent(coreType);
          expect(lookup.source).toBe("core");
          expect(lookup.component).not.toBeNull();
          expect(lookup.metadata).not.toBeNull();
        }

        // Verify core count unchanged
        const counts = registry.getComponentCount();
        expect(counts.core).toBe(coreCountBefore);
      }),
      { numRuns: 100 }
    );
  });

  it("should allow retrieval of newly registered plugins without affecting core lookups", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Register plugin
        const result = registry.registerComponent(plugin);
        expect(result.success).toBe(true);

        // Verify plugin is retrievable
        const pluginLookup = registry.getComponent(plugin.id);
        expect(pluginLookup.source).toBe("plugin");
        expect(pluginLookup.isPlugin).toBe(true);
        expect(pluginLookup.component).toBe(MockComponent);

        // Verify core components still work
        const coreLookup = registry.getComponent(ComponentType.HERO_PRISM);
        expect(coreLookup.source).toBe("core");
        expect(coreLookup.isPlugin).toBe(false);
        expect(coreLookup.component).not.toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("should maintain correct component counts after multiple plugin registrations", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (pluginCount) => {
          // Reset registry at the start of each property test iteration
          ExtensibleComponentRegistry.resetInstance();
          const registry = ExtensibleComponentRegistry.getInstance();

          const coreCount = Object.values(ComponentType).length;
          let registeredCount = 0;

          // Generate unique plugins for this iteration
          for (let i = 0; i < pluginCount; i++) {
            const plugin: ExtendedComponentPlugin = {
              id: `tool_custom_test_${i}_${Date.now()}`,
              component: MockComponent,
              metadata: {
                name: `Test Plugin ${i}`,
                description: `Test plugin description ${i}`,
                category: "hero",
                requiredProps: [],
                optionalProps: [],
              },
              validateProps: () => ({ valid: true, errors: [], warnings: [] }),
            };

            const result = registry.registerComponent(plugin);
            if (result.success) {
              registeredCount++;
            }
          }

          // Verify counts
          const counts = registry.getComponentCount();
          expect(counts.core).toBe(coreCount);
          expect(counts.plugins).toBe(registeredCount);
          expect(counts.total).toBe(coreCount + registeredCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve core component validation after plugin registration", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Register plugin
        registry.registerComponent(plugin);

        // Verify core validation still works
        const validProps = { name: "Test", title: "Test Title" };
        const invalidProps = {};

        const validResult = registry.validateProps(
          ComponentType.HERO_PRISM,
          validProps
        );
        expect(validResult.valid).toBe(true);

        const invalidResult = registry.validateProps(
          ComponentType.HERO_PRISM,
          invalidProps
        );
        expect(invalidResult.valid).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("should correctly categorize plugins alongside core components", () => {
    fc.assert(
      fc.property(
        categoryArb.chain((category) =>
          metadataArb(category).map((metadata) => ({
            id: `tool_test_${Math.random().toString(36).slice(2)}`,
            component: MockComponent,
            metadata,
            validateProps: () => ({ valid: true, errors: [], warnings: [] }),
          }))
        ),
        (plugin) => {
          ExtensibleComponentRegistry.resetInstance();
          const registry = ExtensibleComponentRegistry.getInstance();

          // Get category components before
          const categoryBefore = registry.getComponentsByCategory(
            plugin.metadata.category
          );

          // Register plugin
          registry.registerComponent(plugin);

          // Get category components after
          const categoryAfter = registry.getComponentsByCategory(
            plugin.metadata.category
          );

          // Plugin should be added to category
          expect(categoryAfter.length).toBe(categoryBefore.length + 1);
          expect(categoryAfter).toContain(plugin.id);

          // All original components should still be present
          for (const original of categoryBefore) {
            expect(categoryAfter).toContain(original);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow unregistering plugins without affecting core components", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Register then unregister
        registry.registerComponent(plugin);
        const removed = registry.unregisterComponent(plugin.id);
        expect(removed).toBe(true);

        // Plugin should be gone
        const pluginLookup = registry.getComponent(plugin.id);
        expect(pluginLookup.source).toBe("not_found");

        // Core components should still work
        for (const coreType of Object.values(ComponentType)) {
          const lookup = registry.getComponent(coreType);
          expect(lookup.source).toBe("core");
          expect(lookup.component).not.toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should not allow unregistering core components", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ComponentType)),
        (coreType) => {
          ExtensibleComponentRegistry.resetInstance();
          const registry = ExtensibleComponentRegistry.getInstance();

          // Attempt to unregister core component
          const removed = registry.unregisterComponent(coreType);
          expect(removed).toBe(false);

          // Core component should still exist
          const lookup = registry.getComponent(coreType);
          expect(lookup.source).toBe("core");
          expect(lookup.component).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve fallback behavior after plugin registration", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Register plugin
        registry.registerComponent(plugin);

        // Verify fallbacks still work for all categories
        const categories = ["hero", "experience", "skills", "stats"] as const;
        for (const category of categories) {
          const fallback = registry.getFallbackComponent(category);
          expect(fallback).not.toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should handle enabling/disabling plugins without affecting core components", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Register and disable plugin
        registry.registerComponent(plugin);
        registry.disableComponent(plugin.id);

        // Plugin should be disabled
        expect(registry.isComponentEnabled(plugin.id)).toBe(false);

        // Core components should still be enabled
        for (const coreType of Object.values(ComponentType)) {
          expect(registry.isComponentEnabled(coreType)).toBe(true);
        }

        // Re-enable plugin
        registry.enableComponent(plugin.id);
        expect(registry.isComponentEnabled(plugin.id)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should maintain hasComponent consistency for core and plugins", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        ExtensibleComponentRegistry.resetInstance();
        const registry = ExtensibleComponentRegistry.getInstance();

        // Before registration
        expect(registry.hasComponent(plugin.id)).toBe(false);

        // After registration
        registry.registerComponent(plugin);
        expect(registry.hasComponent(plugin.id)).toBe(true);

        // Core components always exist
        for (const coreType of Object.values(ComponentType)) {
          expect(registry.hasComponent(coreType)).toBe(true);
        }

        // After unregistration
        registry.unregisterComponent(plugin.id);
        expect(registry.hasComponent(plugin.id)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Plugin Manager Isolation", () => {
  /**
   * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
   * **Validates: Requirements 5.3**
   */

  beforeEach(() => {
    PluginManager.resetInstance();
  });

  it("should validate plugin structure before registration", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.oneof(fc.constant(""), fc.constant(null as unknown as string)),
          component: fc.constant(MockComponent),
          metadata: fc.constant({
            name: "Test",
            description: "Test",
            category: "hero" as const,
            requiredProps: [],
            optionalProps: [],
          }),
          validateProps: fc.constant(() => ({
            valid: true,
            errors: [],
            warnings: [],
          })),
        }),
        (invalidPlugin) => {
          PluginManager.resetInstance();
          const manager = PluginManager.getInstance();

          const result = manager.registerPlugin(
            invalidPlugin as unknown as ExtendedComponentPlugin
          );
          expect(result.success).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("should warn when overwriting existing plugins", () => {
    fc.assert(
      fc.property(pluginArb, (plugin) => {
        PluginManager.resetInstance();
        const manager = PluginManager.getInstance();

        // Register twice
        manager.registerPlugin(plugin);
        const result = manager.registerPlugin(plugin);

        expect(result.success).toBe(true);
        expect(result.warnings.some((w) => w.includes("overwritten"))).toBe(
          true
        );
      }),
      { numRuns: 100 }
    );
  });

  it("should maintain plugin count accurately", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }).chain((n) => uniquePluginsArb(n)),
        (plugins) => {
          PluginManager.resetInstance();
          const manager = PluginManager.getInstance();

          let expectedCount = 0;
          for (const plugin of plugins) {
            const result = manager.registerPlugin(plugin);
            if (result.success) {
              expectedCount++;
            }
          }

          expect(manager.getPluginCount()).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Configuration Manager Isolation", () => {
  /**
   * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
   * **Validates: Requirements 5.3**
   */

  beforeEach(() => {
    ComponentConfigManager.resetInstance();
  });

  it("should preserve default settings when updating component settings", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(ComponentType)),
        fc.boolean(),
        fc.integer({ min: 100, max: 1000 }),
        (componentId, animationsEnabled, animationDuration) => {
          ComponentConfigManager.resetInstance();
          const manager = ComponentConfigManager.getInstance();

          // Update specific settings
          manager.updateComponentSettings(componentId, {
            animationsEnabled,
            animationDuration,
          });

          // Get settings
          const settings = manager.getComponentSettings(componentId);

          // Updated values should be present
          expect(settings.animationsEnabled).toBe(animationsEnabled);
          expect(settings.animationDuration).toBe(animationDuration);

          // Default values should still be present for other properties
          expect(settings.showTooltips).toBe(true); // default
          expect(Array.isArray(settings.customClasses)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should track disabled components correctly", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...Object.values(ComponentType)), {
          minLength: 1,
          maxLength: 5,
        }),
        (componentsToDisable) => {
          ComponentConfigManager.resetInstance();
          const manager = ComponentConfigManager.getInstance();

          // Disable components
          for (const id of componentsToDisable) {
            manager.disableComponent(id);
          }

          // Verify disabled
          const uniqueDisabled = [...new Set(componentsToDisable)];
          for (const id of uniqueDisabled) {
            expect(manager.isComponentDisabled(id)).toBe(true);
          }

          // Re-enable and verify
          for (const id of uniqueDisabled) {
            manager.enableComponent(id);
            expect(manager.isComponentDisabled(id)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should validate layouts against configuration", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...Object.values(ComponentType)), {
          minLength: 1,
          maxLength: 15,
        }),
        (componentIds) => {
          ComponentConfigManager.resetInstance();
          const manager = ComponentConfigManager.getInstance();

          // Set max components to 5
          manager.updateGlobalConfig({ maxComponentsPerLayout: 5 });

          const result = manager.validateLayout(componentIds);

          if (componentIds.length > 5) {
            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes("exceeds"))).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
