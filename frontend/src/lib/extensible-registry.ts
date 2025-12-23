/**
 * Extensible Component Registry
 * Extends the base component registry with plugin support and configuration management
 * Requirements: 5.3 - Support extension without breaking existing functionality
 * 
 * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
 */

import type { ComponentType as ReactComponentType } from "react";
import { ComponentType } from "@/types/portfolio";
import {
  ComponentRegistry,
  componentRegistry,
  COMPONENT_MAP,
  FALLBACK_COMPONENTS,
  type ComponentMetadata,
  type ValidationResult,
  type RegistryEntry,
} from "./component-registry";
import {
  PluginManager,
  pluginManager,
  type ExtendedComponentPlugin,
  type ToolDefinition,
} from "./component-plugin-system";
import {
  ComponentConfigManager,
  configManager,
} from "./component-config-manager";

/**
 * Extended registry entry with plugin support
 */
export interface ExtendedRegistryEntry extends RegistryEntry {
  isPlugin: boolean;
  pluginId?: string;
  toolDefinition?: ToolDefinition;
}

/**
 * Component lookup result
 */
export interface ComponentLookupResult {
  component: ReactComponentType<any> | null;
  metadata: ComponentMetadata | null;
  isPlugin: boolean;
  isEnabled: boolean;
  source: "core" | "plugin" | "not_found";
}

/**
 * ExtensibleComponentRegistry Class
 * Combines core registry, plugin system, and configuration management
 */
export class ExtensibleComponentRegistry {
  private static instance: ExtensibleComponentRegistry;
  private coreRegistry: ComponentRegistry;
  private pluginManager: PluginManager;
  private configManager: ComponentConfigManager;
  private customComponents: Map<string, ExtendedRegistryEntry>;

  private constructor() {
    this.coreRegistry = componentRegistry;
    // Get fresh instances after potential reset
    this.pluginManager = PluginManager.getInstance();
    this.configManager = ComponentConfigManager.getInstance();
    this.customComponents = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExtensibleComponentRegistry {
    if (!ExtensibleComponentRegistry.instance) {
      ExtensibleComponentRegistry.instance = new ExtensibleComponentRegistry();
    }
    return ExtensibleComponentRegistry.instance;
  }

  /**
   * Reset the registry (useful for testing)
   */
  public static resetInstance(): void {
    PluginManager.resetInstance();
    ComponentConfigManager.resetInstance();
    ExtensibleComponentRegistry.instance = new ExtensibleComponentRegistry();
  }

  /**
   * Register a custom component via plugin
   */
  public registerComponent<P>(plugin: ExtendedComponentPlugin<P>): {
    success: boolean;
    errors: string[];
    warnings: string[];
  } {
    // Check if custom components are allowed
    if (!this.configManager.getGlobalConfig().allowCustomComponents) {
      return {
        success: false,
        errors: ["Custom components are not allowed in current configuration"],
        warnings: [],
      };
    }

    // Register with plugin manager
    const result = this.pluginManager.registerPlugin(plugin);

    if (result.success) {
      // Add to custom components map
      this.customComponents.set(plugin.id, {
        component: plugin.component as ReactComponentType<any>,
        metadata: plugin.metadata,
        validateProps: plugin.validateProps,
        isPlugin: true,
        pluginId: plugin.id,
        toolDefinition: plugin.toolDefinition,
      });
    }

    return {
      success: result.success,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  /**
   * Unregister a custom component
   */
  public unregisterComponent(componentId: string): boolean {
    // Cannot unregister core components
    if (this.isCoreComponent(componentId)) {
      return false;
    }

    const removed = this.pluginManager.unregisterPlugin(componentId);
    if (removed) {
      this.customComponents.delete(componentId);
    }
    return removed;
  }

  /**
   * Check if a component is a core component
   */
  public isCoreComponent(componentId: string): boolean {
    return Object.values(ComponentType).includes(componentId as ComponentType);
  }

  /**
   * Get a component by ID (checks both core and plugins)
   */
  public getComponent(componentId: string): ComponentLookupResult {
    // Check if component is disabled
    const isEnabled = !this.configManager.isComponentDisabled(componentId);

    // Check core registry first
    if (this.isCoreComponent(componentId)) {
      const component = this.coreRegistry.getComponent(componentId);
      const metadata = this.coreRegistry.getMetadata(componentId);
      return {
        component,
        metadata,
        isPlugin: false,
        isEnabled,
        source: "core",
      };
    }

    // Check custom components
    const customEntry = this.customComponents.get(componentId);
    if (customEntry) {
      const pluginEnabled = this.pluginManager.isPluginEnabled(componentId);
      return {
        component: customEntry.component,
        metadata: customEntry.metadata,
        isPlugin: true,
        isEnabled: isEnabled && pluginEnabled,
        source: "plugin",
      };
    }

    // Not found
    return {
      component: null,
      metadata: null,
      isPlugin: false,
      isEnabled: false,
      source: "not_found",
    };
  }

  /**
   * Get all available components (core + enabled plugins)
   */
  public getAllComponents(): Map<string, ExtendedRegistryEntry> {
    const result = new Map<string, ExtendedRegistryEntry>();

    // Add core components
    for (const type of Object.values(ComponentType)) {
      if (!this.configManager.isComponentDisabled(type)) {
        const component = COMPONENT_MAP[type];
        const metadata = this.coreRegistry.getMetadata(type);
        if (component && metadata) {
          result.set(type, {
            component,
            metadata,
            validateProps: (props) => this.coreRegistry.validateProps(type, props),
            isPlugin: false,
          });
        }
      }
    }

    // Add enabled plugin components
    for (const [id, entry] of this.customComponents) {
      if (
        !this.configManager.isComponentDisabled(id) &&
        this.pluginManager.isPluginEnabled(id)
      ) {
        result.set(id, entry);
      }
    }

    return result;
  }

  /**
   * Get components by category (core + plugins)
   */
  public getComponentsByCategory(category: string): string[] {
    const result: string[] = [];

    // Add core components
    const coreComponents = this.coreRegistry.getComponentsByCategory(
      category as ComponentMetadata["category"]
    );
    for (const type of coreComponents) {
      if (!this.configManager.isComponentDisabled(type)) {
        result.push(type);
      }
    }

    // Add plugin components
    const pluginComponents = this.pluginManager.getPluginsByCategory(category);
    for (const plugin of pluginComponents) {
      if (
        !this.configManager.isComponentDisabled(plugin.id) &&
        this.pluginManager.isPluginEnabled(plugin.id)
      ) {
        result.push(plugin.id);
      }
    }

    return result;
  }

  /**
   * Validate props for any component (core or plugin)
   */
  public validateProps(
    componentId: string,
    props: Record<string, unknown>
  ): ValidationResult {
    // Check core registry first
    if (this.isCoreComponent(componentId)) {
      return this.coreRegistry.validateProps(componentId, props);
    }

    // Check plugins
    return this.pluginManager.validatePluginProps(componentId, props);
  }

  /**
   * Get all tool definitions for AI function calling
   */
  public getToolDefinitions(): ToolDefinition[] {
    const definitions: ToolDefinition[] = [];

    // Add plugin tool definitions
    definitions.push(...this.pluginManager.getToolDefinitions());

    return definitions;
  }

  /**
   * Get component count (core + plugins)
   */
  public getComponentCount(): {
    total: number;
    core: number;
    plugins: number;
    enabled: number;
  } {
    const coreCount = Object.values(ComponentType).length;
    const pluginCount = this.pluginManager.getPluginCount();
    const enabledPlugins = this.pluginManager.getEnabledPluginCount();
    const disabledCore = this.configManager
      .getDisabledComponents()
      .filter((id) => this.isCoreComponent(id)).length;

    return {
      total: coreCount + pluginCount,
      core: coreCount,
      plugins: pluginCount,
      enabled: coreCount - disabledCore + enabledPlugins,
    };
  }

  /**
   * Get fallback component for a category
   */
  public getFallbackComponent(
    category: ComponentMetadata["category"]
  ): ReactComponentType<any> | null {
    // Check for custom category default first
    const customDefault = this.pluginManager.getCategoryDefault(category);
    if (customDefault) {
      const lookup = this.getComponent(customDefault);
      if (lookup.component && lookup.isEnabled) {
        return lookup.component;
      }
    }

    // Fall back to core defaults
    const fallbackType = FALLBACK_COMPONENTS[category];
    if (fallbackType && !this.configManager.isComponentDisabled(fallbackType)) {
      return COMPONENT_MAP[fallbackType];
    }

    return null;
  }

  /**
   * Check if the registry has a component
   */
  public hasComponent(componentId: string): boolean {
    if (this.isCoreComponent(componentId)) {
      return this.coreRegistry.hasComponent(componentId);
    }
    return this.customComponents.has(componentId);
  }

  /**
   * Get component settings
   */
  public getComponentSettings(componentId: string) {
    return this.configManager.getComponentSettings(componentId);
  }

  /**
   * Update component settings
   */
  public updateComponentSettings(
    componentId: string,
    settings: Parameters<typeof this.configManager.updateComponentSettings>[1]
  ): void {
    this.configManager.updateComponentSettings(componentId, settings);
  }

  /**
   * Enable a component
   */
  public enableComponent(componentId: string): boolean {
    this.configManager.enableComponent(componentId);
    if (!this.isCoreComponent(componentId)) {
      return this.pluginManager.enablePlugin(componentId);
    }
    return true;
  }

  /**
   * Disable a component
   */
  public disableComponent(componentId: string): void {
    this.configManager.disableComponent(componentId);
    if (!this.isCoreComponent(componentId)) {
      this.pluginManager.disablePlugin(componentId);
    }
  }

  /**
   * Check if a component is enabled
   */
  public isComponentEnabled(componentId: string): boolean {
    if (this.configManager.isComponentDisabled(componentId)) {
      return false;
    }
    if (!this.isCoreComponent(componentId)) {
      return this.pluginManager.isPluginEnabled(componentId);
    }
    return true;
  }

  /**
   * Get the plugin manager instance
   */
  public getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * Get the config manager instance
   */
  public getConfigManager(): ComponentConfigManager {
    return this.configManager;
  }

  /**
   * Get the core registry instance
   */
  public getCoreRegistry(): ComponentRegistry {
    return this.coreRegistry;
  }
}

// Export singleton instance
export const extensibleRegistry = ExtensibleComponentRegistry.getInstance();
