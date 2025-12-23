"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  componentRegistry,
} from "@/lib/component-registry";
import {
  ThemeProvider,
} from "@/lib/theme-context";
import {
  applyGlobalTheme,
  getThemeDefinition,
  isValidTheme,
  DEFAULT_THEME,
} from "@/lib/theme-engine";
import type {
  ComponentConfig,
  LayoutConfiguration,
  CandidateProfile,
} from "@/types/portfolio";
import { ComponentType } from "@/types/portfolio";

/**
 * PortfolioRenderer Component
 * Dynamically renders portfolio components based on AI selections
 * Requirements: 1.4, 5.2, 5.4 - Render complete portfolio using chosen components
 * Requirements: 1.5 - Apply a cohesive color palette that matches the candidate's professional style
 * 
 * **Feature: generative-ui-portfolio, Property 5: Component Rendering Completeness**
 * **Feature: generative-ui-portfolio, Property 6: Theme Consistency Application**
 */

interface PortfolioRendererProps {
  layoutConfig: LayoutConfiguration;
  candidateProfile: CandidateProfile;
  onRenderError?: (componentType: string, error: Error) => void;
}

interface RenderState {
  renderedComponents: string[];
  errors: Map<string, Error>;
  warnings: string[];
}

// Error boundary for individual components
class ComponentErrorBoundary extends React.Component<
  {
    componentType: string;
    fallbackCategory: "hero" | "experience" | "skills" | "stats";
    children: React.ReactNode;
    onError?: (componentType: string, error: Error) => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Component ${this.props.componentType} failed to render:`,
      error,
      errorInfo
    );
    this.props.onError?.(this.props.componentType, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card border-red-500/20 bg-red-500/5 p-6 rounded-lg">
          <p className="text-red-400 text-sm">
            Failed to render component: {this.props.componentType}
          </p>
          <p className="text-white/50 text-xs mt-2">
            {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for unknown types
function FallbackComponent({ type }: { type: string }) {
  return (
    <div className="glass-card border-yellow-500/20 bg-yellow-500/5 p-6 rounded-lg">
      <p className="text-yellow-400 text-sm">
        Unknown component type: {type}
      </p>
      <p className="text-white/50 text-xs mt-2">
        This component type is not registered in the component registry.
      </p>
    </div>
  );
}

// Empty state component
function EmptyPortfolio() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card border-white/10 bg-white/5 p-12 rounded-lg text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          No Components Selected
        </h2>
        <p className="text-white/60">
          The AI analysis did not select any components for this portfolio.
          Please try uploading a different resume.
        </p>
      </div>
    </div>
  );
}


/**
 * Get the category for a component type
 */
function getComponentCategory(
  type: ComponentType
): "hero" | "experience" | "skills" | "stats" {
  const metadata = componentRegistry.getMetadata(type);
  return metadata?.category ?? "hero";
}

/**
 * Prepare props for a component based on its type and candidate profile
 */
function prepareComponentProps(
  config: ComponentConfig,
  profile: CandidateProfile
): Record<string, unknown> {
  const baseProps = { ...config.props };

  // Inject profile data based on component type
  switch (config.type) {
    case ComponentType.HERO_PRISM:
    case ComponentType.HERO_TERMINAL:
      return {
        ...baseProps,
        name: baseProps.name ?? profile.name,
        title: baseProps.title ?? profile.title,
        contact: baseProps.contact ?? profile.contact,
      };

    case ComponentType.EXP_TIMELINE:
    case ComponentType.EXP_MASONRY:
      return {
        ...baseProps,
        experiences: baseProps.experiences ?? profile.experience,
        projects: baseProps.projects ?? profile.projects,
      };

    case ComponentType.SKILLS_DOTS:
    case ComponentType.SKILLS_RADAR:
      return {
        ...baseProps,
        skills: baseProps.skills ?? profile.skills,
      };

    case ComponentType.STATS_BENTO:
      return {
        ...baseProps,
        achievements: baseProps.achievements ?? profile.achievements ?? [],
      };

    default:
      return baseProps;
  }
}

/**
 * Main PortfolioRenderer component
 */
export function PortfolioRenderer({
  layoutConfig,
  candidateProfile,
  onRenderError,
}: PortfolioRendererProps) {
  const [renderState, setRenderState] = React.useState<RenderState>({
    renderedComponents: [],
    errors: new Map(),
    warnings: [],
  });

  // Determine the theme to use
  const globalTheme = React.useMemo(() => {
    const theme = layoutConfig.globalTheme;
    return isValidTheme(theme) ? theme : DEFAULT_THEME;
  }, [layoutConfig.globalTheme]);

  // Apply theme on mount and when it changes - non-blocking
  React.useEffect(() => {
    applyGlobalTheme(globalTheme);
  }, [globalTheme]);

  // Validate layout configuration on mount
  React.useEffect(() => {
    const validation = componentRegistry.validateLayoutComponents(
      layoutConfig.components
    );
    if (validation.warnings.length > 0) {
      setRenderState((prev) => ({
        ...prev,
        warnings: validation.warnings,
      }));
      validation.warnings.forEach((w) => console.warn("Layout warning:", w));
    }
  }, [layoutConfig]);

  // Handle component render errors
  const handleComponentError = React.useCallback(
    (componentType: string, error: Error) => {
      setRenderState((prev) => {
        const newErrors = new Map(prev.errors);
        newErrors.set(componentType, error);
        return { ...prev, errors: newErrors };
      });
      onRenderError?.(componentType, error);
    },
    [onRenderError]
  );

  // Sort components by order
  const sortedComponents = React.useMemo(() => {
    return [...layoutConfig.components].sort((a, b) => a.order - b.order);
  }, [layoutConfig.components]);

  // Handle empty layout
  if (sortedComponents.length === 0) {
    return <EmptyPortfolio />;
  }

  // Get theme definition for CSS variables
  const themeDefinition = getThemeDefinition(globalTheme);

  return (
    <ThemeProvider initialTheme={globalTheme}>
      <div
        className={`min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 ${themeDefinition.cssClass}`}
        style={
          {
            "--theme-primary": themeDefinition.colors.primary,
            "--theme-secondary": themeDefinition.colors.secondary,
            "--theme-accent": themeDefinition.colors.accent,
            "--theme-glow": themeDefinition.colors.glow,
          } as React.CSSProperties
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {sortedComponents.map((config, index) => {
              const Component = componentRegistry.getComponent(config.type);

              if (!Component) {
                return (
                  <motion.div
                    key={`fallback-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FallbackComponent type={config.type} />
                  </motion.div>
                );
              }

              const props = prepareComponentProps(config, candidateProfile);
              const category = getComponentCategory(config.type as ComponentType);

              return (
                <motion.section
                  key={`${config.type}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="w-full"
                >
                  <ComponentErrorBoundary
                    componentType={config.type}
                    fallbackCategory={category}
                    onError={handleComponentError}
                  >
                    <Component {...props} />
                  </ComponentErrorBoundary>
                </motion.section>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && renderState.warnings.length > 0 && (
          <div className="fixed bottom-4 right-4 max-w-sm p-4 glass-card border-yellow-500/20 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 text-xs font-medium mb-2">
              Layout Warnings:
            </p>
            <ul className="text-yellow-300/70 text-xs space-y-1">
              {renderState.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default PortfolioRenderer;
