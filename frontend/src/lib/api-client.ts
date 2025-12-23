/**
 * API Client for Portfolio Generation
 * Handles communication with Django backend for resume processing
 * Requirements: 1.4, 7.1
 */

import type {
  GenerateLayoutRequest,
  GenerateLayoutResponse,
  GenerateLayoutOptions,
  ProcessingProgressEvent,
  ProcessingStage,
  ApiResponse,
  ApiErrorResponse,
} from '@/types/api';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/portfolio';

/**
 * API Error class for handling backend errors
 */
export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  status: number;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromResponse(error: ApiErrorResponse, status: number): ApiError {
    return new ApiError(
      error.error,
      error.code,
      status,
      error.details
    );
  }
}

/**
 * Loading state for API operations
 */
export interface LoadingState {
  isLoading: boolean;
  stage: ProcessingStage | null;
  progress: number;
  message: string;
}

/**
 * Initial loading state
 */
export const initialLoadingState: LoadingState = {
  isLoading: false,
  stage: null,
  progress: 0,
  message: '',
};

/**
 * Progress callback type
 */
export type ProgressCallback = (event: ProcessingProgressEvent) => void;

/**
 * Generate portfolio layout from resume file
 * 
 * @param file - Resume file (PDF, PNG, JPG, JPEG)
 * @param options - Optional generation options
 * @param onProgress - Optional progress callback for real-time updates
 * @returns Promise with generated layout response
 * 
 * Requirements: 1.1, 1.4, 7.1
 */
export async function generateLayout(
  file: File,
  options?: GenerateLayoutOptions,
  onProgress?: ProgressCallback
): Promise<GenerateLayoutResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    formData.append('options', JSON.stringify(options));
  }

  // Use SSE endpoint if progress callback is provided
  if (onProgress) {
    return generateLayoutWithProgress(formData, onProgress);
  }

  // Standard POST request
  const response = await fetch(`${API_BASE_URL}/generate-layout`, {
    method: 'POST',
    body: formData,
  });

  const data: ApiResponse<GenerateLayoutResponse> = await response.json();

  if (!response.ok || !data.success) {
    throw ApiError.fromResponse(
      data.error || { error: 'Unknown error', code: 'UNKNOWN_ERROR' },
      response.status
    );
  }

  return data.data!;
}

/**
 * Generate layout with real-time progress updates via SSE
 */
async function generateLayoutWithProgress(
  formData: FormData,
  onProgress: ProgressCallback
): Promise<GenerateLayoutResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastProcessedIndex = 0;
    let finalResult: GenerateLayoutResponse | null = null;

    xhr.open('POST', `${API_BASE_URL}/generate-layout/stream`);
    
    xhr.onprogress = () => {
      const responseText = xhr.responseText;
      const newData = responseText.substring(lastProcessedIndex);
      lastProcessedIndex = responseText.length;

      // Parse SSE events
      const events = newData.split('\n\n').filter(Boolean);
      
      for (const eventStr of events) {
        if (eventStr.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(eventStr.substring(6));
            
            // Check if this is a progress event or final result
            if (eventData.stage) {
              const progressEvent: ProcessingProgressEvent = {
                stage: eventData.stage,
                progress: eventData.progress,
                message: eventData.message,
                timestamp: new Date(eventData.timestamp),
              };
              onProgress(progressEvent);
            }
            
            // Check for final result (nested under 'result' key)
            if (eventData.result && eventData.result.components && eventData.result.theme) {
              finalResult = eventData.result;
            }
            // Also check for direct components/theme (backward compatibility)
            else if (eventData.components && eventData.theme) {
              finalResult = eventData;
            }
            
            // Check for error
            if (eventData.error) {
              reject(new ApiError(
                eventData.error.error || eventData.message || 'Processing failed',
                eventData.error.code || 'PROCESSING_ERROR',
                500,
                eventData.error.details
              ));
            }
          } catch (e) {
            // Ignore parse errors for partial data
          }
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (finalResult) {
          resolve(finalResult);
        } else {
          // Try to parse the final response
          try {
            const lines = xhr.responseText.split('\n\n').filter(Boolean);
            for (let i = lines.length - 1; i >= 0; i--) {
              if (lines[i].startsWith('data: ')) {
                const data = JSON.parse(lines[i].substring(6));
                // Check for nested result
                if (data.result && data.result.components && data.result.theme) {
                  resolve(data.result);
                  return;
                }
                // Check for direct components/theme
                if (data.components && data.theme) {
                  resolve(data);
                  return;
                }
              }
            }
            reject(new ApiError('No result received', 'NO_RESULT', 500));
          } catch (e) {
            reject(new ApiError('Failed to parse response', 'PARSE_ERROR', 500));
          }
        }
      } else {
        reject(new ApiError(
          'Request failed',
          'REQUEST_FAILED',
          xhr.status
        ));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError(
        'Network error',
        'NETWORK_ERROR',
        0
      ));
    };

    xhr.send(formData);
  });
}

/**
 * Check processing status for a given processing ID
 * 
 * @param processingId - UUID of the processing job
 * @returns Promise with processing status
 */
export async function checkProcessingStatus(
  processingId: string
): Promise<ProcessingProgressEvent> {
  const response = await fetch(
    `${API_BASE_URL}/processing-status/${processingId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw ApiError.fromResponse(
      data.error || { error: 'Unknown error', code: 'UNKNOWN_ERROR' },
      response.status
    );
  }

  return {
    stage: data.stage,
    progress: data.progress,
    message: data.message,
    timestamp: new Date(data.timestamp),
  };
}

/**
 * Validate file before upload
 * 
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];
  const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    };
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidType = ALLOWED_TYPES.includes(file.type) || 
                      ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!isValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, PNG, JPG, or JPEG file.',
    };
  }

  return { valid: true };
}

/**
 * Get human-readable stage name
 */
export function getStageName(stage: ProcessingStage): string {
  const stageNames: Record<ProcessingStage, string> = {
    uploading: 'Uploading',
    ocr_processing: 'Extracting Text',
    ai_analysis: 'Analyzing Profile',
    component_selection: 'Selecting Components',
    layout_generation: 'Generating Layout',
    complete: 'Complete',
    error: 'Error',
  };
  return stageNames[stage] || stage;
}
