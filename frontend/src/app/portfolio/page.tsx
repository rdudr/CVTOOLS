"use client";

import * as React from "react";
import { PortfolioRenderer } from "@/components/portfolio/PortfolioRenderer";
import { ParticleBackground } from "@/components/portfolio/ParticleBackground";
import { HeroProfessional } from "@/components/portfolio/HeroProfessional";
import type { LayoutConfiguration, CandidateProfile } from "@/types/portfolio";
import {
  ComponentType,
  ProfessionalCategory,
  ThemePalette,
} from "@/types/portfolio";

/**
 * Portfolio Page
 * Dynamic portfolio rendering based on AI-selected components
 * Requirements: 1.4, 5.2, 5.4
 */

// Demo data for testing - in production this would come from API
const demoProfile: CandidateProfile = {
  id: "demo-1",
  name: "Alex Johnson",
  title: "Senior Software Engineer",
  professionalCategory: ProfessionalCategory.TECHNICAL,
  skills: [
    { name: "TypeScript", level: 5, category: "Languages" },
    { name: "React", level: 5, category: "Frontend" },
    { name: "Node.js", level: 4, category: "Backend" },
    { name: "Python", level: 4, category: "Languages" },
    { name: "AWS", level: 4, category: "Cloud" },
    { name: "PostgreSQL", level: 4, category: "Database" },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "2021-01",
      description:
        "Led development of microservices architecture serving 10M+ users",
      highlights: [
        "Reduced API latency by 40%",
        "Mentored team of 5 engineers",
      ],
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      startDate: "2018-06",
      endDate: "2020-12",
      description: "Full-stack development for B2B SaaS platform",
      highlights: ["Built real-time collaboration features", "Implemented CI/CD pipeline"],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. Computer Science",
      institution: "MIT",
      graduationDate: "2018-05",
      honors: ["Magna Cum Laude"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Open Source CLI Tool",
      description: "Developer productivity tool with 5k+ GitHub stars",
      technologies: ["Rust", "CLI"],
      url: "https://github.com/example",
    },
  ],
  contact: {
    email: "alex@example.com",
    github: "https://github.com/alexj",
    linkedin: "https://linkedin.com/in/alexj",
    location: "San Francisco, CA",
  },
  extractedText: "",
  confidence: 0.92,
  achievements: [
    { id: "ach-1", label: "Years Experience", value: 6 },
    { id: "ach-2", label: "Projects Completed", value: 25 },
    { id: "ach-3", label: "GitHub Stars", value: "5k+" },
    { id: "ach-4", label: "Team Size Led", value: 5 },
  ],
};

const demoLayout: LayoutConfiguration = {
  components: [
    {
      type: ComponentType.EXP_TIMELINE,
      props: {},
      order: 1,
    },
    {
      type: ComponentType.SKILLS_RADAR,
      props: {},
      order: 2,
    },
    {
      type: ComponentType.STATS_BENTO,
      props: {},
      order: 3,
    },
  ],
  globalTheme: ThemePalette.NEON_BLUE,
  metadata: {
    generatedAt: new Date(),
    aiConfidence: 0.92,
    professionalCategory: ProfessionalCategory.TECHNICAL,
  },
};

export default function PortfolioPage() {
  const [layoutConfig, setLayoutConfig] =
    React.useState<LayoutConfiguration | null>(null);
  const [candidateProfile, setCandidateProfile] =
    React.useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load portfolio data - in production this would fetch from API
  React.useEffect(() => {
    // Simulate API call
    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        // In production: const response = await fetch('/api/portfolio/[id]');
        // For now, use demo data
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLayoutConfig(demoLayout);
        setCandidateProfile(demoProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load portfolio");
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  // Handle render errors
  const handleRenderError = React.useCallback(
    (componentType: string, error: Error) => {
      console.error(`Render error in ${componentType}:`, error);
      // In production: send to error tracking service
    },
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="glass-card border-red-500/20 bg-red-500/5 p-8 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  if (!layoutConfig || !candidateProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="glass-card border-white/10 bg-white/5 p-8 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">No Portfolio Data</h2>
          <p className="text-white/60">
            Portfolio configuration not found. Please generate a portfolio first.
          </p>
        </div>
      </div>
    );
  }

  // Get accent color based on theme
  const getAccentColor = () => {
    switch (layoutConfig.globalTheme) {
      case ThemePalette.NEON_BLUE:
        return "#22d3ee"; // cyan
      case ThemePalette.EMERALD_GREEN:
        return "#34d399"; // emerald
      case ThemePalette.CYBER_PINK:
        return "#ec4899"; // pink
      default:
        return "#22d3ee";
    }
  };

  // Get particle color based on theme
  const getParticleColor = () => {
    switch (layoutConfig.globalTheme) {
      case ThemePalette.NEON_BLUE:
        return "rgba(34, 211, 238, 0.6)"; // cyan
      case ThemePalette.EMERALD_GREEN:
        return "rgba(52, 211, 153, 0.6)"; // emerald
      case ThemePalette.CYBER_PINK:
        return "rgba(236, 72, 153, 0.6)"; // pink
      default:
        return "rgba(34, 211, 238, 0.6)";
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <ParticleBackground
        particleCount={60}
        particleColor={getParticleColor()}
        connectParticles={true}
        connectionDistance={120}
        speed={0.5}
      />
      <div className="relative z-10">
        {/* Professional Hero Section */}
        <HeroProfessional
          name={candidateProfile.name}
          title={candidateProfile.title}
          contact={candidateProfile.contact}
          accentColor={getAccentColor()}
        />
        {/* Rest of portfolio components */}
        <PortfolioRenderer
          layoutConfig={layoutConfig}
          candidateProfile={candidateProfile}
          onRenderError={handleRenderError}
        />
      </div>
    </div>
  );
}
