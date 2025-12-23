/**
 * Component Registry
 * Maps AI tool calls to React components with type-safe lookups and validation
 * Requirements: 5.1, 5.2 - Maintain mappings between AI tool calls and React components
 * 
 * **Feature: generative-ui-portfolio, Property 7: Component Registry Integrity**
 */

import type { ComponentType as ReactComponentType } from "react";
import {
  ComponentType,
  type HeroPrismProps,
  type HeroTerminalProps,
  type ExpTimelineProps,
  type ExpMasonryProps,
  type SkillDotsProps,
  type SkillRadarProps,
  type BentoGridProps,
  type ComponentConfig,
  HeroTheme,
} from "@/types/portfolio";
import {
  HeroPrism,
  HeroTerminal,
  ExpTimeline,
  ExpMasonry,
  SkillDots,
  SkillRadar,
  BentoGrid,
} from "@/components/portfolio";

// Union type of all component props
export type PortfolioComponentProps =
  | HeroPrismProps
  | HeroTerminalProps
  | ExpTimelineProps
  | ExpMasonryProps
  | SkillDotsProps
  | SkillRadarProps
  | BentoGridProps;

// Component metadata for registry entries
export interface ComponentMetadata {
  name: string;
  description: string;
  category: "hero" | "experience" | "skills" | "stats";
  requiredProps: string[];
  optionalProps: string[];
}

// Registry entry combining component and metadata
export interface RegistryEntry<P = PortfolioComponentProps> {
  component: ReactComponentType<P>;
  metadata: ComponentMetadata;
  validateProps: (props: Record<string, unknown>) => ValidationResult;
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Type guard for checking if a value is a valid ComponentType
export function isValidComponentType(type: string): type is ComponentType {
  return Object.values(ComponentType).includes(type as ComponentType);
}

// Prop validators for each component type
const propValidators: Record<
  ComponentType,
  (props: Record<string, unknown>) => ValidationResult
> = {
  [ComponentType.HERO_PRISM]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.name || typeof props.name !== "string") {
      errors.push("HeroPrism requires 'name' prop of type string");
    }
    if (!props.title || typeof props.title !== "string") {
      errors.push("HeroPrism requires 'title' prop of type string");
    }
    if (props.theme && !Object.values(HeroTheme).includes(props.theme as HeroTheme)) {
      warnings.push(`Invalid theme '${props.theme}', will use default 'ocean'`);
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.HERO_TERMINAL]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.name || typeof props.name !== "string") {
      errors.push("HeroTerminal requires 'name' prop of type string");
    }
    if (!props.title || typeof props.title !== "string") {
      errors.push("HeroTerminal requires 'title' prop of type string");
    }
    if (!props.commands || !Array.isArray(props.commands)) {
      errors.push("HeroTerminal requires 'commands' prop of type string[]");
    }
    if (props.theme && !Object.values(HeroTheme).includes(props.theme as HeroTheme)) {
      warnings.push(`Invalid theme '${props.theme}', will use default 'matrix'`);
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.EXP_TIMELINE]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.experiences || !Array.isArray(props.experiences)) {
      errors.push("ExpTimeline requires 'experiences' prop of type Experience[]");
    } else if (props.experiences.length === 0) {
      warnings.push("ExpTimeline received empty experiences array");
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.EXP_MASONRY]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.experiences || !Array.isArray(props.experiences)) {
      errors.push("ExpMasonry requires 'experiences' prop of type Experience[]");
    } else if (props.experiences.length === 0) {
      warnings.push("ExpMasonry received empty experiences array");
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.SKILLS_DOTS]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.skills || !Array.isArray(props.skills)) {
      errors.push("SkillDots requires 'skills' prop of type Skill[]");
    } else if (props.skills.length === 0) {
      warnings.push("SkillDots received empty skills array");
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.SKILLS_RADAR]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.skills || !Array.isArray(props.skills)) {
      errors.push("SkillRadar requires 'skills' prop of type Skill[]");
    } else if (props.skills.length === 0) {
      warnings.push("SkillRadar received empty skills array");
    } else if (props.skills.length < 3) {
      warnings.push("SkillRadar works best with at least 3 skills for radar visualization");
    }

    return { valid: errors.length === 0, errors, warnings };
  },

  [ComponentType.STATS_BENTO]: (props) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!props.achievements || !Array.isArray(props.achievements)) {
      errors.push("BentoGrid requires 'achievements' prop of type Achievement[]");
    } else if (props.achievements.length === 0) {
      warnings.push("BentoGrid received empty achievements array");
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

// Component metadata definitions
const componentMetadata: Record<ComponentType, ComponentMetadata> = {
  [ComponentType.HERO_PRISM]: {
    name: "HeroPrism",
    description: "Liquid glass hero section with interactive cursor effects",
    category: "hero",
    requiredProps: ["name", "title"],
    optionalProps: ["theme", "subtitle", "contact"],
  },
  [ComponentType.HERO_TERMINAL]: {
    name: "HeroTerminal",
    description: "Terminal-style hero section with typewriter effects",
    category: "hero",
    requiredProps: ["name", "title", "commands"],
    optionalProps: ["theme"],
  },
  [ComponentType.EXP_TIMELINE]: {
    name: "ExpTimeline",
    description: "Vertical timeline layout with connected experience cards",
    category: "experience",
    requiredProps: ["experiences"],
    optionalProps: ["theme"],
  },
  [ComponentType.EXP_MASONRY]: {
    name: "ExpMasonry",
    description: "Staggered grid layout for creative portfolios",
    category: "experience",
    requiredProps: ["experiences"],
    optionalProps: ["projects", "theme"],
  },
  [ComponentType.SKILLS_DOTS]: {
    name: "SkillDots",
    description: "1-5 glowing neon dot skill indicators",
    category: "skills",
    requiredProps: ["skills"],
    optionalProps: ["maxLevel", "theme"],
  },
  [ComponentType.SKILLS_RADAR]: {
    name: "SkillRadar",
    description: "Hexagonal spider chart for comprehensive skills",
    category: "skills",
    requiredProps: ["skills"],
    optionalProps: ["theme"],
  },
  [ComponentType.STATS_BENTO]: {
    name: "BentoGrid",
    description: "Achievement statistics in bento box layout",
    category: "stats",
    requiredProps: ["achievements"],
    optionalProps: ["theme"],
  },
};

// Main component registry mapping tool calls to React components
const COMPONENT_MAP: Record<ComponentType, ReactComponentType<any>> = {
  [ComponentType.HERO_PRISM]: HeroPrism,
  [ComponentType.HERO_TERMINAL]: HeroTerminal,
  [ComponentType.EXP_TIMELINE]: ExpTimeline,
  [ComponentType.EXP_MASONRY]: ExpMasonry,
  [ComponentType.SKILLS_DOTS]: SkillDots,
  [ComponentType.SKILLS_RADAR]: SkillRadar,
  [ComponentType.STATS_BENTO]: BentoGrid,
};


/**
 * ComponentRegistry Class
 * Provides type-safe component lookups and validation for dynamic rendering
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private registry: Map<ComponentType, RegistryEntry>;

  private constructor() {
    this.registry = new Map();
    this.initializeRegistry();
  }

  /**
   * Get singleton instance of ComponentRegistry
   */
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Initialize registry with all component mappings
   */
  private initializeRegistry(): void {
    for (const type of Object.values(ComponentType)) {
      this.registry.set(type, {
        component: COMPONENT_MAP[type],
        metadata: componentMetadata[type],
        validateProps: propValidators[type],
      });
    }
  }

  /**
   * Get a component by its tool call type
   * Returns null if component type is not found
   */
  public getComponent(type: string): ReactComponentType<any> | null {
    if (!isValidComponentType(type)) {
      console.warn(`Unknown component type: ${type}`);
      return null;
    }
    const entry = this.registry.get(type);
    return entry?.component ?? null;
  }

  /**
   * Get component metadata by type
   */
  public getMetadata(type: string): ComponentMetadata | null {
    if (!isValidComponentType(type)) {
      return null;
    }
    const entry = this.registry.get(type);
    return entry?.metadata ?? null;
  }

  /**
   * Validate props for a specific component type
   */
  public validateProps(
    type: string,
    props: Record<string, unknown>
  ): ValidationResult {
    if (!isValidComponentType(type)) {
      return {
        valid: false,
        errors: [`Unknown component type: ${type}`],
        warnings: [],
      };
    }
    const entry = this.registry.get(type);
    if (!entry) {
      return {
        valid: false,
        errors: [`Component not found in registry: ${type}`],
        warnings: [],
      };
    }
    return entry.validateProps(props);
  }

  /**
   * Check if a component type exists in the registry
   */
  public hasComponent(type: string): boolean {
    return isValidComponentType(type) && this.registry.has(type);
  }

  /**
   * Get all registered component types
   */
  public getRegisteredTypes(): ComponentType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all components by category
   */
  public getComponentsByCategory(
    category: ComponentMetadata["category"]
  ): ComponentType[] {
    const result: ComponentType[] = [];
    for (const [type, entry] of this.registry) {
      if (entry.metadata.category === category) {
        result.push(type);
      }
    }
    return result;
  }

  /**
   * Validate a complete component configuration
   */
  public validateComponentConfig(config: ComponentConfig): ValidationResult {
    const typeValidation = this.validateProps(config.type, config.props);
    const errors = [...typeValidation.errors];
    const warnings = [...typeValidation.warnings];

    if (typeof config.order !== "number" || config.order < 0) {
      errors.push("Component config requires a non-negative 'order' number");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate an array of component configurations
   * Checks for ordering and completeness
   */
  public validateLayoutComponents(
    configs: ComponentConfig[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(configs)) {
      return {
        valid: false,
        errors: ["Layout components must be an array"],
        warnings: [],
      };
    }

    if (configs.length === 0) {
      warnings.push("Layout has no components configured");
    }

    // Check for hero component
    const heroComponents = configs.filter(
      (c) =>
        c.type === ComponentType.HERO_PRISM ||
        c.type === ComponentType.HERO_TERMINAL
    );
    if (heroComponents.length === 0) {
      warnings.push("Layout has no hero component");
    } else if (heroComponents.length > 1) {
      warnings.push("Layout has multiple hero components");
    }

    // Validate each component config
    const orders = new Set<number>();
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const validation = this.validateComponentConfig(config);
      
      if (!validation.valid) {
        errors.push(`Component ${i} (${config.type}): ${validation.errors.join(", ")}`);
      }
      warnings.push(...validation.warnings.map((w) => `Component ${i}: ${w}`));

      // Check for duplicate orders
      if (orders.has(config.order)) {
        warnings.push(`Duplicate order value ${config.order} found`);
      }
      orders.add(config.order);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance for convenience
export const componentRegistry = ComponentRegistry.getInstance();

// Export component map for direct access if needed
export { COMPONENT_MAP };

// Default/fallback component configurations for error recovery
export const FALLBACK_COMPONENTS: Record<
  ComponentMetadata["category"],
  ComponentType
> = {
  hero: ComponentType.HERO_PRISM,
  experience: ComponentType.EXP_TIMELINE,
  skills: ComponentType.SKILLS_DOTS,
  stats: ComponentType.STATS_BENTO,
};

/**
 * Get a fallback component for a given category
 * Used when the requested component fails to render
 */
export function getFallbackComponent(
  category: ComponentMetadata["category"]
): ReactComponentType<any> {
  const fallbackType = FALLBACK_COMPONENTS[category];
  return COMPONENT_MAP[fallbackType];
}
