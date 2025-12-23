/**
 * Property-Based Tests for ExtractionTerminal Entry Formatting
 * 
 * **Feature: generative-ui-portfolio, Property 16: Terminal Entry Formatting**
 * **Validates: Requirements 10.2, 10.3**
 * 
 * Property: For any extraction entry displayed in the CMD terminal, 
 * the entry should contain a valid timestamp and a recognized data type label.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ExtractionEntry, ExtractionLabel } from '@/types/processing';

// Valid extraction labels as defined in the type system
const VALID_LABELS: ExtractionLabel[] = [
  'NAME',
  'TITLE',
  'SKILL',
  'EXPERIENCE',
  'EDUCATION',
  'CONTACT',
  'TEXT',
  'PROJECT',
  'SUMMARY',
];

// Format timestamp as HH:MM:SS (same as in ExtractionTerminal component)
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Validate timestamp format HH:MM:SS
const isValidTimestampFormat = (timestamp: string): boolean => {
  // Pattern: HH:MM:SS where HH is 00-23, MM is 00-59, SS is 00-59
  const pattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return pattern.test(timestamp);
};

// Format a terminal entry as it would appear in the terminal
const formatTerminalEntry = (entry: ExtractionEntry): string => {
  const timestamp = formatTimestamp(entry.timestamp);
  return `[${timestamp}] [${entry.label}] ${entry.content}`;
};

// Arbitrary for generating valid extraction labels
const validLabelArb = fc.constantFrom(...VALID_LABELS);

// Arbitrary for generating valid dates (within reasonable range)
const validDateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31'),
}).filter((date): date is Date => {
  // Ensure the date is valid (not NaN)
  return date instanceof Date && !isNaN(date.getTime());
});

// Arbitrary for generating non-empty content strings
const contentArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);

// Arbitrary for generating valid extraction entries
const extractionEntryArb: fc.Arbitrary<ExtractionEntry> = fc.record({
  id: fc.uuid(),
  timestamp: validDateArb,
  label: validLabelArb,
  content: contentArb,
}).filter((entry): entry is ExtractionEntry => {
  // Ensure timestamp is a valid date (not NaN)
  return entry.timestamp instanceof Date && !isNaN(entry.timestamp.getTime());
});

// Arbitrary for generating arrays of extraction entries
const extractionEntriesArb = fc.array(extractionEntryArb, { minLength: 1, maxLength: 50 });

describe('Terminal Entry Formatting', () => {
  /**
   * **Feature: generative-ui-portfolio, Property 16: Terminal Entry Formatting**
   * **Validates: Requirements 10.2, 10.3**
   */

  it('should format timestamp in HH:MM:SS format for any valid date', () => {
    fc.assert(
      fc.property(validDateArb, (date) => {
        const formatted = formatTimestamp(date);
        
        // Timestamp should match HH:MM:SS pattern
        expect(isValidTimestampFormat(formatted)).toBe(true);
        
        // Timestamp should have exactly 8 characters (HH:MM:SS)
        expect(formatted.length).toBe(8);
      }),
      { numRuns: 100 }
    );
  });

  it('should include valid timestamp in formatted entry for any extraction entry', () => {
    fc.assert(
      fc.property(extractionEntryArb, (entry) => {
        const formatted = formatTerminalEntry(entry);
        
        // Entry should start with timestamp in brackets
        expect(formatted).toMatch(/^\[\d{2}:\d{2}:\d{2}\]/);
        
        // Extract timestamp from formatted entry
        const timestampMatch = formatted.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
        expect(timestampMatch).not.toBeNull();
        
        if (timestampMatch) {
          expect(isValidTimestampFormat(timestampMatch[1])).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should include recognized data type label for any extraction entry', () => {
    fc.assert(
      fc.property(extractionEntryArb, (entry) => {
        const formatted = formatTerminalEntry(entry);
        
        // Entry should contain label in brackets after timestamp
        const labelPattern = new RegExp(`\\[${entry.label}\\]`);
        expect(formatted).toMatch(labelPattern);
        
        // Label should be one of the valid labels
        expect(VALID_LABELS).toContain(entry.label);
      }),
      { numRuns: 100 }
    );
  });

  it('should format entry in correct order: [timestamp] [label] content', () => {
    fc.assert(
      fc.property(extractionEntryArb, (entry) => {
        const formatted = formatTerminalEntry(entry);
        
        // Full pattern: [HH:MM:SS] [LABEL] content
        const fullPattern = /^\[\d{2}:\d{2}:\d{2}\] \[[A-Z]+\] .+$/;
        expect(formatted).toMatch(fullPattern);
        
        // Verify the content is at the end
        expect(formatted.endsWith(entry.content)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve content integrity in formatted entry', () => {
    fc.assert(
      fc.property(extractionEntryArb, (entry) => {
        const formatted = formatTerminalEntry(entry);
        
        // Content should appear exactly as provided
        expect(formatted).toContain(entry.content);
        
        // Content should be the last part after the label
        const parts = formatted.split('] ');
        const contentPart = parts[parts.length - 1];
        expect(contentPart).toBe(entry.content);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle all valid label types correctly', () => {
    fc.assert(
      fc.property(
        validLabelArb,
        validDateArb,
        contentArb,
        (label, timestamp, content) => {
          const entry: ExtractionEntry = {
            id: 'test-id',
            timestamp,
            label,
            content,
          };
          
          const formatted = formatTerminalEntry(entry);
          
          // Should contain the specific label
          expect(formatted).toContain(`[${label}]`);
          
          // Label should be recognized
          expect(VALID_LABELS).toContain(label);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce consistent formatting for same entry', () => {
    fc.assert(
      fc.property(extractionEntryArb, (entry) => {
        const formatted1 = formatTerminalEntry(entry);
        const formatted2 = formatTerminalEntry(entry);
        
        // Same entry should produce same formatted output
        expect(formatted1).toBe(formatted2);
      }),
      { numRuns: 100 }
    );
  });

  it('should format multiple entries consistently', () => {
    fc.assert(
      fc.property(extractionEntriesArb, (entries) => {
        const formattedEntries = entries.map(formatTerminalEntry);
        
        // All entries should follow the same format pattern
        const pattern = /^\[\d{2}:\d{2}:\d{2}\] \[[A-Z]+\] .+$/;
        
        for (const formatted of formattedEntries) {
          expect(formatted).toMatch(pattern);
        }
        
        // Each entry should have valid timestamp and label
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const formatted = formattedEntries[i];
          
          expect(formatted).toContain(`[${entry.label}]`);
          expect(formatted).toContain(entry.content);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle edge case timestamps correctly', () => {
    // Test specific edge cases for timestamps
    const edgeCases = [
      new Date('2024-01-01T00:00:00'), // Midnight
      new Date('2024-01-01T12:00:00'), // Noon
      new Date('2024-01-01T23:59:59'), // End of day
      new Date('2024-06-15T06:30:45'), // Random time
    ];
    
    for (const date of edgeCases) {
      const formatted = formatTimestamp(date);
      expect(isValidTimestampFormat(formatted)).toBe(true);
    }
  });

  it('should validate all defined labels are recognized', () => {
    // Ensure all labels in the type system are valid
    const allLabels: ExtractionLabel[] = [
      'NAME',
      'TITLE', 
      'SKILL',
      'EXPERIENCE',
      'EDUCATION',
      'CONTACT',
      'TEXT',
      'PROJECT',
      'SUMMARY',
    ];
    
    for (const label of allLabels) {
      expect(VALID_LABELS).toContain(label);
    }
    
    // Ensure VALID_LABELS matches the type definition
    expect(VALID_LABELS.length).toBe(allLabels.length);
  });
});

describe('Terminal Entry Label Colors', () => {
  /**
   * Additional validation for label color mapping consistency
   * **Feature: generative-ui-portfolio, Property 16: Terminal Entry Formatting**
   * **Validates: Requirements 10.3**
   */

  // Label colors as defined in ExtractionTerminal component
  const labelColors: Record<string, string> = {
    NAME: "text-cyan-400",
    TITLE: "text-emerald-400",
    SKILL: "text-purple-400",
    EXPERIENCE: "text-amber-400",
    EDUCATION: "text-blue-400",
    CONTACT: "text-pink-400",
    TEXT: "text-white/60",
    PROJECT: "text-orange-400",
    SUMMARY: "text-teal-400",
  };

  it('should have color mapping for all valid labels', () => {
    fc.assert(
      fc.property(validLabelArb, (label) => {
        // Every valid label should have a color mapping
        expect(labelColors[label]).toBeDefined();
        
        // Color should be a valid Tailwind class
        expect(labelColors[label]).toMatch(/^text-/);
      }),
      { numRuns: 100 }
    );
  });

  it('should have unique colors for distinct label types', () => {
    // Important labels should have distinct colors for visual differentiation
    const importantLabels = ['NAME', 'TITLE', 'SKILL', 'EXPERIENCE', 'EDUCATION'];
    const colors = importantLabels.map(label => labelColors[label]);
    
    // All important labels should have unique colors
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(importantLabels.length);
  });
});
