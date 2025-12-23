/**
 * Component Plugin System
 * Provides extensible architecture for adding new UI components to the portfolio system
 * Requirements: 5.3 - Support extension without breaking existing functionality
 * 
 * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
 */

import type { ComponentType as ReactComponentType } from "react";
import type { ComponentMetadata, ValidationResult, PortfolioComponentProps } from "./component-registry";

/**
 * Plugin definition for registering new components
 */
export interface ComponentPlugin<P = PortfolioComponentProps> {
  /** Unique identifier for the component (e.g., 'tool_custom_hero') */
  id: string;
  /** The React component to render */
  component: ReactComponentType<P>;
  /** Component metadata for registry */
  metadata: ComponentMetadata;
  /** Props validator function */
  validateProps: (props: Record<string, unknown>) => ValidationResult;
  /** Optional: AI tool definition for Gemini function calling */
  toolDefinition?: ToolDefinition;
}

/**
 * Tool definition for AI function calling
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
}

/**
 * Parameter definition for tool functions
 */
export interface ParameterDefinition {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: ParameterDefinition;
  required?: boolean;
  default?: unknown;
}

/**
 * Plugin registration result
 */
export interface PluginRegistrationResult {
  success: boolean;
  pluginId: string;
  errors: string[];
  warnings: string[];
}

/**
 * Plugin configuration options
 */
export interface PluginConfig {
  /** Whether the plugin is enabled */
  enabled: boolean;
  /** Priority for component selection (higher = preferred) */
  priority: number;
  /** Custom settings for the plugin */
  settings: Record<string, unknown>;
}

/**
 * Component availability configuration
 */
export interface ComponentAvailabilityConfig {
  /** Components that are enabled */
  enabledComponents: string[];
  /** Components that are disabled */
  disabledComponents: string[];
  /** Default components for each category */
  categoryDefaults: Record<string, string>;
  /** Component priority overrides */
  priorityOverrides: Record<string, number>;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycleHooks {
  /** Called when plugin is registered */
  onRegister?: () => void;
  /** Called when plugin is unregistered */
  onUnregister?: () => void;
  /** Called before component renders */
  beforeRender?: (props: Record<string, unknown>) => Record<string, unknown>;
  /** Called after component renders */
  afterRender?: () => void;
}

/**
 * Extended plugin with lifecycle hooks
 */
export interface ExtendedComponentPlugin<P = PortfolioComponentProps> extends ComponentPlugin<P> {
  hooks?: PluginLifecycleHooks;
  config?: PluginConfig;
}

/**
 * Plugin Manager Class
 * Manages registration, configuration, and lifecycle of component plugins
 */
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, ExtendedComponentPlugin>;
  private configs: Map<string, PluginConfig>;
  private availabilityConfig: ComponentAvailabilityConfig;

  private constructor() {
    this.plugins = new Map();
    this.configs = new Map();
    this.availabilityConfig = {
      enabledComponents: [],
      disabledComponents: [],
      categoryDefaults: {},
      priorityOverrides: {},
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Reset the plugin manager (useful for testing)
   */
  public static resetInstance(): void {
    PluginManager.instance = new PluginManager();
  }

  /**
   * Register a new component plugin
   */
  public registerPlugin<P>(plugin: ExtendedComponentPlugin<P>): PluginRegistrationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate plugin structure
    if (!plugin.id || typeof plugin.id !== "string") {
      errors.push("Plugin must have a valid string id");
    }

    if (!plugin.component || typeof plugin.component !== "function") {
      errors.push("Plugin must have a valid React component");
    }

    if (!plugin.metadata) {
      errors.push("Plugin must have metadata");
    } else {
      if (!plugin.metadata.name) errors.push("Plugin metadata must have a name");
      if (!plugin.metadata.category) errors.push("Plugin metadata must have a category");
      if (!plugin.metadata.requiredProps) errors.push("Plugin metadata must have requiredProps");
    }

    if (!plugin.validateProps || typeof plugin.validateProps !== "function") {
      errors.push("Plugin must have a validateProps function");
    }

    // Check for duplicate registration
    if (this.plugins.has(plugin.id)) {
      warnings.push(`Plugin ${plugin.id} already registered, will be overwritten`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        pluginId: plugin.id || "unknown",
        errors,
        warnings,
      };
    }

    // Register the plugin
    this.plugins.set(plugin.id, plugin as ExtendedComponentPlugin);

    // Set default config if not provided
    if (!this.configs.has(plugin.id)) {
      this.configs.set(plugin.id, plugin.config || {
        enabled: true,
        priority: 0,
        settings: {},
      });
    }

    // Call onRegister hook if provided
    if (plugin.hooks?.onRegister) {
      try {
        plugin.hooks.onRegister();
      } catch (error) {
        warnings.push(`onRegister hook failed: ${error}`);
      }
    }

    return {
      success: true,
      pluginId: plugin.id,
      errors: [],
      warnings,
    };
  }

  /**
   * Unregister a component plugin
   */
  public unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Call onUnregister hook if provided
    if (plugin.hooks?.onUnregister) {
      try {
        plugin.hooks.onUnregister();
      } catch (error) {
        console.warn(`onUnregister hook failed for ${pluginId}:`, error);
      }
    }

    this.plugins.delete(pluginId);
    this.configs.delete(pluginId);
    return true;
  }

  /**
   * Get a registered plugin by ID
   */
  public getPlugin(pluginId: string): ExtendedComponentPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  public getAllPlugins(): ExtendedComponentPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   */
  public getPluginsByCategory(category: string): ExtendedComponentPlugin[] {
    return Array.from(this.plugins.values()).filter(
      (plugin) => plugin.metadata.category === category
    );
  }

  /**
   * Check if a plugin is registered
   */
  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin configuration
   */
  public getPluginConfig(pluginId: string): PluginConfig | undefined {
    return this.configs.get(pluginId);
  }

  /**
   * Update plugin configuration
   */
  public updatePluginConfig(pluginId: string, config: Partial<PluginConfig>): boolean {
    const existingConfig = this.configs.get(pluginId);
    if (!existingConfig) {
      return false;
    }

    this.configs.set(pluginId, {
      ...existingConfig,
      ...config,
      settings: {
        ...existingConfig.settings,
        ...(config.settings || {}),
      },
    });

    return true;
  }

  /**
   * Enable a plugin
   */
  public enablePlugin(pluginId: string): boolean {
    return this.updatePluginConfig(pluginId, { enabled: true });
  }

  /**
   * Disable a plugin
   */
  public disablePlugin(pluginId: string): boolean {
    return this.updatePluginConfig(pluginId, { enabled: false });
  }

  /**
   * Check if a plugin is enabled
   */
  public isPluginEnabled(pluginId: string): boolean {
    const config = this.configs.get(pluginId);
    return config?.enabled ?? false;
  }

  /**
   * Get enabled plugins only
   */
  public getEnabledPlugins(): ExtendedComponentPlugin[] {
    return Array.from(this.plugins.entries())
      .filter(([id]) => this.isPluginEnabled(id))
      .map(([, plugin]) => plugin);
  }

  /**
   * Set component availability configuration
   */
  public setAvailabilityConfig(config: Partial<ComponentAvailabilityConfig>): void {
    this.availabilityConfig = {
      ...this.availabilityConfig,
      ...config,
    };
  }

  /**
   * Get component availability configuration
   */
  public getAvailabilityConfig(): ComponentAvailabilityConfig {
    return { ...this.availabilityConfig };
  }

  /**
   * Check if a component is available
   */
  public isComponentAvailable(componentId: string): boolean {
    // Check if explicitly disabled
    if (this.availabilityConfig.disabledComponents.includes(componentId)) {
      return false;
    }

    // Check if explicitly enabled (if enabledComponents is set)
    if (this.availabilityConfig.enabledComponents.length > 0) {
      return this.availabilityConfig.enabledComponents.includes(componentId);
    }

    // Check plugin enabled status
    return this.isPluginEnabled(componentId);
  }

  /**
   * Get the default component for a category
   */
  public getCategoryDefault(category: string): string | undefined {
    return this.availabilityConfig.categoryDefaults[category];
  }

  /**
   * Set the default component for a category
   */
  public setCategoryDefault(category: string, componentId: string): void {
    this.availabilityConfig.categoryDefaults[category] = componentId;
  }

  /**
   * Get component priority
   */
  public getComponentPriority(componentId: string): number {
    // Check for override first
    if (this.availabilityConfig.priorityOverrides[componentId] !== undefined) {
      return this.availabilityConfig.priorityOverrides[componentId];
    }

    // Fall back to plugin config priority
    const config = this.configs.get(componentId);
    return config?.priority ?? 0;
  }

  /**
   * Set component priority override
   */
  public setComponentPriority(componentId: string, priority: number): void {
    this.availabilityConfig.priorityOverrides[componentId] = priority;
  }

  /**
   * Get all tool definitions for AI function calling
   */
  public getToolDefinitions(): ToolDefinition[] {
    return this.getEnabledPlugins()
      .filter((plugin) => plugin.toolDefinition)
      .map((plugin) => plugin.toolDefinition!);
  }

  /**
   * Validate plugin props with lifecycle hooks
   */
  public validatePluginProps(
    pluginId: string,
    props: Record<string, unknown>
  ): ValidationResult {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return {
        valid: false,
        errors: [`Plugin not found: ${pluginId}`],
        warnings: [],
      };
    }

    // Apply beforeRender hook if present
    let processedProps = props;
    if (plugin.hooks?.beforeRender) {
      try {
        processedProps = plugin.hooks.beforeRender(props);
      } catch (error) {
        return {
          valid: false,
          errors: [`beforeRender hook failed: ${error}`],
          warnings: [],
        };
      }
    }

    return plugin.validateProps(processedProps);
  }

  /**
   * Get plugin count
   */
  public getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * Get enabled plugin count
   */
  public getEnabledPluginCount(): number {
    return this.getEnabledPlugins().length;
  }
}

// Export singleton instance
export const pluginManager = PluginManager.getInstance();

/**
 * Helper function to create a component plugin
 */
export function createComponentPlugin<P>(
  config: ExtendedComponentPlugin<P>
): ExtendedComponentPlugin<P> {
  return config;
}

/**
 * Helper function to create a simple props validator
 */
export function createPropsValidator(
  requiredProps: string[],
  propTypes: Record<string, "string" | "number" | "boolean" | "array" | "object">
): (props: Record<string, unknown>) => ValidationResult {
  return (props: Record<string, unknown>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required props
    for (const prop of requiredProps) {
      if (props[prop] === undefined || props[prop] === null) {
        errors.push(`Missing required prop: ${prop}`);
      }
    }

    // Check prop types
    for (const [prop, expectedType] of Object.entries(propTypes)) {
      if (props[prop] !== undefined) {
        const actualType = Array.isArray(props[prop]) ? "array" : typeof props[prop];
        if (actualType !== expectedType) {
          errors.push(`Prop '${prop}' expected ${expectedType}, got ${actualType}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  };
}
