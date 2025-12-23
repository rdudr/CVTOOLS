/**
 * API Client Tests
 * End-to-end workflow testing for portfolio generation
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  validateFile,
  getStageName,
  ApiError,
  initialLoadingState,
} from './api-client';
import { ProcessingStage } from '@/types/api';

describe('API Client - File Validation', () => {
  /**
   * Test file validation for various file types
   * Requirements: 6.1, 6.2
   */
  describe('validateFile', () => {
    it('should accept valid PDF files', () => {
      const file = new File(['test content'], 'resume.pdf', {
        type: 'application/pdf',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG files', () => {
      const file = new File(['test content'], 'resume.png', {
        type: 'image/png',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid JPG files', () => {
      const file = new File(['test content'], 'resume.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid JPEG files', () => {
      const file = new File(['test content'], 'resume.jpeg', {
        type: 'image/jpeg',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject files exceeding 10MB', () => {
      // Create a mock file with size > 10MB
      const largeContent = new ArrayBuffer(11 * 1024 * 1024);
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    it('should reject invalid file types', () => {
      const file = new File(['test content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject executable files', () => {
      const file = new File(['test content'], 'malware.exe', {
        type: 'application/x-msdownload',
      });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });

    /**
     * Property test: File validation should be consistent
     * For any valid file type and size, validation should pass
     */
    it('should consistently validate files based on type and size', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('pdf', 'png', 'jpg', 'jpeg'),
          fc.integer({ min: 1, max: 10 * 1024 * 1024 - 1 }),
          (extension, size) => {
            const mimeTypes: Record<string, string> = {
              pdf: 'application/pdf',
              png: 'image/png',
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
            };
            const content = new ArrayBuffer(size);
            const file = new File([content], `test.${extension}`, {
              type: mimeTypes[extension],
            });
            const result = validateFile(file);
            return result.valid === true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

describe('API Client - Stage Names', () => {
  /**
   * Test stage name mapping
   * Requirements: 7.1
   */
  describe('getStageName', () => {
    it('should return correct names for all stages', () => {
      const stages: ProcessingStage[] = [
        'uploading' as ProcessingStage,
        'ocr_processing' as ProcessingStage,
        'ai_analysis' as ProcessingStage,
        'component_selection' as ProcessingStage,
        'layout_generation' as ProcessingStage,
        'complete' as ProcessingStage,
        'error' as ProcessingStage,
      ];

      const expectedNames = [
        'Uploading',
        'Extracting Text',
        'Analyzing Profile',
        'Selecting Components',
        'Generating Layout',
        'Complete',
        'Error',
      ];

      stages.forEach((stage, index) => {
        expect(getStageName(stage)).toBe(expectedNames[index]);
      });
    });

    it('should return stage value for unknown stages', () => {
      const unknownStage = 'unknown_stage' as ProcessingStage;
      expect(getStageName(unknownStage)).toBe('unknown_stage');
    });
  });
});

describe('API Client - Error Handling', () => {
  /**
   * Test API error class
   * Requirements: 6.4
   */
  describe('ApiError', () => {
    it('should create error with all properties', () => {
      const error = new ApiError('Test error', 'TEST_CODE', 400, { key: 'value' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.details).toEqual({ key: 'value' });
      expect(error.name).toBe('ApiError');
    });

    it('should create error from response', () => {
      const response = {
        error: 'Server error',
        code: 'SERVER_ERROR',
        details: { reason: 'timeout' },
      };
      const error = ApiError.fromResponse(response, 500);
      expect(error.message).toBe('Server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.status).toBe(500);
      expect(error.details).toEqual({ reason: 'timeout' });
    });
  });
});

describe('API Client - Loading State', () => {
  /**
   * Test initial loading state
   * Requirements: 7.1
   */
  describe('initialLoadingState', () => {
    it('should have correct initial values', () => {
      expect(initialLoadingState.isLoading).toBe(false);
      expect(initialLoadingState.stage).toBeNull();
      expect(initialLoadingState.progress).toBe(0);
      expect(initialLoadingState.message).toBe('');
    });
  });
});
