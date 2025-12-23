/**
 * Portfolio Type Definitions
 * Defines interfaces for candidate profiles, component configurations, and layout settings
 * Requirements: 1.2, 4.1
 */

// Professional category enum for candidate classification
export enum ProfessionalCategory {
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
  CORPORATE = 'corporate',
  HYBRID = 'hybrid',
}

// Component type enum mapping to AI tool calls
export enum ComponentType {
  HERO_PRISM = 'tool_hero_prism',
  HERO_TERMINAL = 'tool_hero_terminal',
  EXP_TIMELINE = 'tool_exp_timeline',
  EXP_MASONRY = 'tool_exp_masonry',
  SKILLS_DOTS = 'tool_skills_dots',
  SKILLS_RADAR = 'tool_skills_radar',
  STATS_BENTO = 'tool_stats_bento',
}

// Theme palette options
export enum ThemePalette {
  NEON_BLUE = 'neon_blue',
  EMERALD_GREEN = 'emerald_green',
  CYBER_PINK = 'cyber_pink',
}

// Hero theme variants
export enum HeroTheme {
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  FOREST = 'forest',
  MATRIX = 'matrix',
  CYBERPUNK = 'cyberpunk',
  MINIMAL = 'minimal',
}

// Skill representation
export interface Skill {
  name: string;
  level: number; // 1-5 for dots, 0-100 for radar
  category?: string;
}

// Work experience entry
export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  highlights?: string[];
}

// Education entry
export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
}

// Project entry
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  highlights?: string[];
}


// Contact information
export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

// Achievement/statistic for bento grid
export interface Achievement {
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

// Candidate profile extracted from resume
export interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  professionalCategory: ProfessionalCategory;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  contact: ContactInfo;
  extractedText: string;
  confidence: number;
  summary?: string;
  achievements?: Achievement[];
}

// Component configuration for dynamic rendering
export interface ComponentConfig {
  type: ComponentType;
  props: Record<string, unknown>;
  order: number;
  theme?: string;
}

// Layout configuration returned by AI
export interface LayoutConfiguration {
  components: ComponentConfig[];
  globalTheme: ThemePalette;
  metadata: LayoutMetadata;
}

// Metadata about the generation process
export interface LayoutMetadata {
  generatedAt: Date;
  aiConfidence: number;
  professionalCategory: ProfessionalCategory;
  processingTimeMs?: number;
}

// Processing result from backend
export interface ProcessingResult {
  success: boolean;
  candidateProfile: CandidateProfile;
  layoutConfig: LayoutConfiguration;
  processingTime: number;
  errors?: string[];
}

// Hero Prism component props
export interface HeroPrismProps {
  theme: HeroTheme;
  title: string;
  subtitle?: string;
  name: string;
  contact?: ContactInfo;
}

// Hero Terminal component props
export interface HeroTerminalProps {
  theme: HeroTheme;
  commands: string[];
  name: string;
  title: string;
}

// Experience Timeline component props
export interface ExpTimelineProps {
  experiences: Experience[];
  theme?: string;
}

// Experience Masonry component props
export interface ExpMasonryProps {
  experiences: Experience[];
  projects?: Project[];
  theme?: string;
}

// Skills Dots component props
export interface SkillDotsProps {
  skills: Skill[];
  maxLevel?: number;
  theme?: string;
}

// Skills Radar component props
export interface SkillRadarProps {
  skills: Skill[];
  theme?: string;
}

// Bento Grid component props
export interface BentoGridProps {
  achievements: Achievement[];
  theme?: string;
}
