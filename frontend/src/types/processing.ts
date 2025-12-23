/**
 * Processing Feedback Type Definitions
 * Defines interfaces for extraction terminal, processing stats, and feedback state
 * Requirements: 8.1, 9.1, 10.1
 */

// Extraction entry label types
export type ExtractionLabel = 
  | 'NAME' 
  | 'TITLE' 
  | 'SKILL' 
  | 'EXPERIENCE' 
  | 'EDUCATION' 
  | 'CONTACT' 
  | 'TEXT'
  | 'PROJECT'
  | 'SUMMARY';

// Single extraction entry for terminal display
export interface ExtractionEntry {
  id: string;
  timestamp: Date;
  label: ExtractionLabel;
  content: string;
}

// Processing metrics for CountUp display
export interface ProcessingMetrics {
  charactersExtracted: number;
  skillsFound: number;
  experienceYears: number;
  confidenceScore: number;
}

// Processing stage types
export type ProcessingStage = 
  | 'idle'
  | 'uploading' 
  | 'extracting' 
  | 'analyzing' 
  | 'generating' 
  | 'complete';

// Complete processing feedback state
export interface ProcessingFeedbackState {
  isProcessing: boolean;
  stage: ProcessingStage;
  progress: number;
  metrics: ProcessingMetrics;
  extractionStream: ExtractionEntry[];
  showGridScan: boolean;
  showTerminal: boolean;
  showStats: boolean;
}

// Initial processing feedback state
export const initialProcessingFeedbackState: ProcessingFeedbackState = {
  isProcessing: false,
  stage: 'idle',
  progress: 0,
  metrics: {
    charactersExtracted: 0,
    skillsFound: 0,
    experienceYears: 0,
    confidenceScore: 0,
  },
  extractionStream: [],
  showGridScan: false,
  showTerminal: false,
  showStats: false,
};

// ExtractionTerminal component props
export interface ExtractionTerminalProps {
  entries: ExtractionEntry[];
  isVisible: boolean;
  isComplete: boolean;
  onFadeComplete?: () => void;
}

// ProcessingStats component props
export interface ProcessingStatsProps {
  metrics: ProcessingMetrics;
  isVisible: boolean;
}

// ProcessingGridScan component props
export interface ProcessingGridScanProps {
  isActive: boolean;
  onFadeComplete?: () => void;
}

// GridScan configuration for Refolio theme
export const GRIDSCAN_CONFIG = {
  linesColor: '#164e63',      // cyan-900
  scanColor: '#22d3ee',       // cyan-400
  scanOpacity: 0.6,
  gridScale: 0.15,
  lineStyle: 'solid' as const,
  scanDirection: 'pingpong' as const,
  scanDuration: 2.5,
  scanDelay: 1.0,
  enablePost: true,
  bloomIntensity: 0.3,
  chromaticAberration: 0.001,
};
