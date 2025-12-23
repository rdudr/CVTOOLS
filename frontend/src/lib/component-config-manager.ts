/**
 * Component Configuration Manager
 * Manages component availability, settings, and runtime configuration
 * Requirements: 5.3 - Configuration management for component availability and settings
 * 
 * **Feature: generative-ui-portfolio, Property 10: System Extensibility Preservation**
 */

import { ComponentType } from "@/types/portfolio";
import type { ComponentMetadata } from "./component-registry";

/**
 * Component settings interface
 */
export interface ComponentSettings {
  /** Whether animations are enabled */
  animationsEnabled: boolean;
  /** Animation duration in milliseconds */
  animationDuration: number;
  /** Whether to show tooltips */
  showTooltips: boolean;
  /** Custom CSS class overrides */
  customClasses: string[];
  /** Theme overrides */
  themeOverrides: Record<string, string>;
  /** Feature flags */
  featureFlags: Record<string, boolean>;
}

/**
 * Global configuration for the component system
 */
export interface GlobalComponentConfig {
  /** Default settings applied to all components */
  defaultSettings: ComponentSettings;
  /** Per-component setting overrides */
  componentOverrides: Record<string, Partial<ComponentSettings>>;
  /** Components that are globally disabled */
  disabledComponents: string[];
  /** Maximum number of components per layout */
  maxComponentsPerLayout: number;
  /** Whether to allow custom/plugin components */
  allowCustomComponents: boolean;
  /** Debug mode */
  debugMode: boolean;
}

/**
 * Component runtime state
 */
export interface ComponentRuntimeState {
  /** Whether the component is currently rendering */
  isRendering: boolean;
  /** Last render timestamp */
  lastRenderTime: number | null;
  /** Render count */
  renderCount: number;
  /** Any runtime errors */
  errors: string[];
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  type: "global" | "component" | "availability";
  componentId?: string;
  previousValue: unknown;
  newValue: unknown;
  timestamp: Date;
}

/**
 * Configuration change listener
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void;

/**
 * Default component settings
 */
const DEFAULT_SETTINGS: ComponentSettings = {
  animationsEnabled: true,
  animationDuration: 300,
  showTooltips: true,
  customClasses: [],
  themeOverrides: {},
  featureFlags: {},
};

/**
 * Default global configuration
 */
const DEFAULT_GLOBAL_CONFIG: GlobalComponentConfig = {
  defaultSettings: DEFAULT_SETTINGS,
  componentOverrides: {},
  disabledComponents: [],
  maxComponentsPerLayout: 10,
  allowCustomComponents: true,
  debugMode: false,
};

/**
 * Component Configuration Manager Class
 * Centralized management of component configuration and settings
 */
export class ComponentConfigManager {
  private static instance: ComponentConfigManager;
  private globalConfig: GlobalComponentConfig;
  private runtimeStates: Map<string, ComponentRuntimeState>;
  private listeners: Set<ConfigChangeListener>;
  private configHistory: ConfigChangeEvent[];
  private maxHistorySize: number = 100;

  private constructor() {
    this.globalConfig = { ...DEFAULT_GLOBAL_CONFIG };
    this.runtimeStates = new Map();
    this.listeners = new Set();
    this.configHistory = [];
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ComponentConfigManager {
    if (!ComponentConfigManager.instance) {
      ComponentConfigManager.instance = new ComponentConfigManager();
    }
    return ComponentConfigManager.instance;
  }

  /**
   * Reset the config manager (useful for testing)
   */
  public static resetInstance(): void {
    ComponentConfigManager.instance = new ComponentConfigManager();
  }

  /**
   * Get the global configuration
   */
  public getGlobalConfig(): GlobalComponentConfig {
    return { ...this.globalConfig };
  }

  /**
   * Update global configuration
   */
  public updateGlobalConfig(config: Partial<GlobalComponentConfig>): void {
    const previousValue = { ...this.globalConfig };
    
    this.globalConfig = {
      ...this.globalConfig,
      ...config,
      defaultSettings: {
        ...this.globalConfig.defaultSettings,
        ...(config.defaultSettings || {}),
      },
      componentOverrides: {
        ...this.globalConfig.componentOverrides,
        ...(config.componentOverrides || {}),
      },
    };

    this.emitChange({
      type: "global",
      previousValue,
      newValue: this.globalConfig,
      timestamp: new Date(),
    });
  }

  /**
   * Get settings for a specific component
   */
  public getComponentSettings(componentId: string): ComponentSettings {
    const overrides = this.globalConfig.componentOverrides[componentId] || {};
    return {
      ...this.globalConfig.defaultSettings,
      ...overrides,
      customClasses: [
        ...this.globalConfig.defaultSettings.customClasses,
        ...(overrides.customClasses || []),
      ],
      themeOverrides: {
        ...this.globalConfig.defaultSettings.themeOverrides,
        ...(overrides.themeOverrides || {}),
      },
      featureFlags: {
        ...this.globalConfig.defaultSettings.featureFlags,
        ...(overrides.featureFlags || {}),
      },
    };
  }

  /**
   * Update settings for a specific component
   */
  public updateComponentSettings(
    componentId: string,
    settings: Partial<ComponentSettings>
  ): void {
    const previousValue = this.globalConfig.componentOverrides[componentId];
    
    this.globalConfig.componentOverrides[componentId] = {
      ...(this.globalConfig.componentOverrides[componentId] || {}),
      ...settings,
    };

    this.emitChange({
      type: "component",
      componentId,
      previousValue,
      newValue: this.globalConfig.componentOverrides[componentId],
      timestamp: new Date(),
    });
  }

  /**
   * Reset component settings to defaults
   */
  public resetComponentSettings(componentId: string): void {
    const previousValue = this.globalConfig.componentOverrides[componentId];
    delete this.globalConfig.componentOverrides[componentId];

    this.emitChange({
      type: "component",
      componentId,
      previousValue,
      newValue: undefined,
      timestamp: new Date(),
    });
  }

  /**
   * Check if a component is disabled
   */
  public isComponentDisabled(componentId: string): boolean {
    return this.globalConfig.disabledComponents.includes(componentId);
  }

  /**
   * Disable a component
   */
  public disableComponent(componentId: string): void {
    if (!this.globalConfig.disabledComponents.includes(componentId)) {
      const previousValue = [...this.globalConfig.disabledComponents];
      this.globalConfig.disabledComponents.push(componentId);

      this.emitChange({
        type: "availability",
        componentId,
        previousValue,
        newValue: this.globalConfig.disabledComponents,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Enable a component
   */
  public enableComponent(componentId: string): void {
    const index = this.globalConfig.disabledComponents.indexOf(componentId);
    if (index !== -1) {
      const previousValue = [...this.globalConfig.disabledComponents];
      this.globalConfig.disabledComponents.splice(index, 1);

      this.emitChange({
        type: "availability",
        componentId,
        previousValue,
        newValue: this.globalConfig.disabledComponents,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get list of disabled components
   */
  public getDisabledComponents(): string[] {
    return [...this.globalConfig.disabledComponents];
  }

  /**
   * Get list of enabled core components
   */
  public getEnabledCoreComponents(): ComponentType[] {
    return Object.values(ComponentType).filter(
      (type) => !this.isComponentDisabled(type)
    );
  }

  /**
   * Set feature flag for a component
   */
  public setFeatureFlag(
    componentId: string,
    flag: string,
    value: boolean
  ): void {
    const currentSettings = this.globalConfig.componentOverrides[componentId] || {};
    this.updateComponentSettings(componentId, {
      featureFlags: {
        ...(currentSettings.featureFlags || {}),
        [flag]: value,
      },
    });
  }

  /**
   * Get feature flag for a component
   */
  public getFeatureFlag(componentId: string, flag: string): boolean {
    const settings = this.getComponentSettings(componentId);
    return settings.featureFlags[flag] ?? false;
  }

  /**
   * Set theme override for a component
   */
  public setThemeOverride(
    componentId: string,
    property: string,
    value: string
  ): void {
    const currentSettings = this.globalConfig.componentOverrides[componentId] || {};
    this.updateComponentSettings(componentId, {
      themeOverrides: {
        ...(currentSettings.themeOverrides || {}),
        [property]: value,
      },
    });
  }

  /**
   * Get runtime state for a component
   */
  public getRuntimeState(componentId: string): ComponentRuntimeState {
    if (!this.runtimeStates.has(componentId)) {
      this.runtimeStates.set(componentId, {
        isRendering: false,
        lastRenderTime: null,
        renderCount: 0,
        errors: [],
      });
    }
    return this.runtimeStates.get(componentId)!;
  }

  /**
   * Update runtime state for a component
   */
  public updateRuntimeState(
    componentId: string,
    state: Partial<ComponentRuntimeState>
  ): void {
    const currentState = this.getRuntimeState(componentId);
    this.runtimeStates.set(componentId, {
      ...currentState,
      ...state,
    });
  }

  /**
   * Record a render for a component
   */
  public recordRender(componentId: string): void {
    const currentState = this.getRuntimeState(componentId);
    this.updateRuntimeState(componentId, {
      lastRenderTime: Date.now(),
      renderCount: currentState.renderCount + 1,
    });
  }

  /**
   * Record an error for a component
   */
  public recordError(componentId: string, error: string): void {
    const currentState = this.getRuntimeState(componentId);
    this.updateRuntimeState(componentId, {
      errors: [...currentState.errors, error],
    });
  }

  /**
   * Clear errors for a component
   */
  public clearErrors(componentId: string): void {
    this.updateRuntimeState(componentId, { errors: [] });
  }

  /**
   * Add a configuration change listener
   */
  public addChangeListener(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Remove a configuration change listener
   */
  public removeChangeListener(listener: ConfigChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Get configuration change history
   */
  public getConfigHistory(): ConfigChangeEvent[] {
    return [...this.configHistory];
  }

  /**
   * Clear configuration history
   */
  public clearConfigHistory(): void {
    this.configHistory = [];
  }

  /**
   * Enable debug mode
   */
  public enableDebugMode(): void {
    this.updateGlobalConfig({ debugMode: true });
  }

  /**
   * Disable debug mode
   */
  public disableDebugMode(): void {
    this.updateGlobalConfig({ debugMode: false });
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.globalConfig.debugMode;
  }

  /**
   * Export configuration as JSON
   */
  public exportConfig(): string {
    return JSON.stringify(this.globalConfig, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  public importConfig(json: string): boolean {
    try {
      const config = JSON.parse(json) as GlobalComponentConfig;
      this.updateGlobalConfig(config);
      return true;
    } catch (error) {
      console.error("Failed to import config:", error);
      return false;
    }
  }

  /**
   * Validate a layout against current configuration
   */
  public validateLayout(componentIds: string[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check max components
    if (componentIds.length > this.globalConfig.maxComponentsPerLayout) {
      errors.push(
        `Layout exceeds maximum components (${componentIds.length}/${this.globalConfig.maxComponentsPerLayout})`
      );
    }

    // Check for disabled components
    for (const id of componentIds) {
      if (this.isComponentDisabled(id)) {
        errors.push(`Component ${id} is disabled`);
      }
    }

    // Check for custom components if not allowed
    if (!this.globalConfig.allowCustomComponents) {
      const coreTypes = Object.values(ComponentType) as string[];
      for (const id of componentIds) {
        if (!coreTypes.includes(id)) {
          errors.push(`Custom component ${id} not allowed`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Emit a configuration change event
   */
  private emitChange(event: ConfigChangeEvent): void {
    // Add to history
    this.configHistory.push(event);
    if (this.configHistory.length > this.maxHistorySize) {
      this.configHistory.shift();
    }

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Config change listener error:", error);
      }
    }
  }
}

// Export singleton instance
export const configManager = ComponentConfigManager.getInstance();

/**
 * Helper to create component settings
 */
export function createComponentSettings(
  overrides: Partial<ComponentSettings> = {}
): ComponentSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...overrides,
  };
}

/**
 * Helper to merge settings
 */
export function mergeSettings(
  base: ComponentSettings,
  overrides: Partial<ComponentSettings>
): ComponentSettings {
  return {
    ...base,
    ...overrides,
    customClasses: [...base.customClasses, ...(overrides.customClasses || [])],
    themeOverrides: { ...base.themeOverrides, ...(overrides.themeOverrides || {}) },
    featureFlags: { ...base.featureFlags, ...(overrides.featureFlags || {}) },
  };
}
