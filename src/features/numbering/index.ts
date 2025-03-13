/**
 * Numbering Feature
 * 
 * This module provides functionality for fixing numbering in ordered lists
 * and section headers in RFC documents.
 */

// Export types
export * from './types';

// Export fix functions
export {
  fixNumberingInLines,
  countChangedLines
} from './fix';

// Import dependencies
import { fixNumberingInLines, countChangedLines } from './fix';
import { NumberingFixResult } from './types';

/**
 * Fix numbering in document text
 * @param text - The document text
 * @returns - The result of the numbering fix operation
 */
export function fixNumbering(text: string): NumberingFixResult {
  try {
    // Split the text into lines
    const lines = text.split('\n');
    
    // Apply numbering fixes
    const fixedLines = fixNumberingInLines(lines);
    
    // Count the number of lines that were changed
    const linesChanged = countChangedLines(lines, fixedLines);
    
    // Return the result
    return {
      success: true,
      linesChanged,
      // Join the lines back into a single string
      fixedText: fixedLines.join('\n')
    } as NumberingFixResult & { fixedText: string };
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error fixing numbering: ${errorMessage}`,
      linesChanged: 0
    };
  }
}