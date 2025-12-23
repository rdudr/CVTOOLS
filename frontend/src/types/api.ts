/**
 * API Type Definitions
 * Defines interfaces for API requests and responses
 * Requirements: 1.1, 1.4
 */

import type {
  ComponentConfig,
  ProfessionalCategory,
  ThemePalette,
  CandidateProfile,
  LayoutConfiguration,
} from './portfolio';

// File upload options
export interface GenerateLayoutOptions {
  themePreference?: ThemePalette | 'auto';
  componentStyle?: 'modern' | 'classic' | 'minimal';
}

// Request payload for layout generation
export interface GenerateLayoutRequest {
  file: File;
  options?: GenerateLayoutOptions;
}

// Candidate profile from API (may have additional fields)
export interface ApiCandidateProfile {
  id?: string;
  name?: string;
  title?: string;
  professionalCategory?: ProfessionalCategory | string;
  skills?: Array<{ name: string; level: number; category?: string }>;
  experience?: Array<{
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
    highlights?: string[];
  }>;
  education?: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
    honors?: string[];
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    highlights?: string[];
  }>;
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    location?: string;
  };
  extractedText?: string;
  confidence?: number;
  summary?: string;
  achievements?: Array<{
    id: string;
    label: string;
    value: string | number;
    icon?: string;
    description?: string;
  }>;
}

// Response from layout generation endpoint
export interface GenerateLayoutResponse {
  components: ComponentConfig[];
  theme: ThemePalette | string;
  metadata: {
    professionalCategory: ProfessionalCategory | string;
    confidence: number;
    processingTimeMs: number;
  };
  candidateProfile: ApiCandidateProfile;
}

// Progress event during processing
export interface ProcessingProgressEvent {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  timestamp: Date;
}

// Processing stages
export enum ProcessingStage {
  UPLOADING = 'uploading',
  OCR_PROCESSING = 'ocr_processing',
  AI_ANALYSIS = 'ai_analysis',
  COMPONENT_SELECTION = 'component_selection',
  LAYOUT_GENERATION = 'layout_generation',
  COMPLETE = 'complete',
  ERROR = 'error',
}

// Error response from API
export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
}
