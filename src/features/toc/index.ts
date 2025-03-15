/**
 * Table of Contents (TOC) Feature
 * 
 * This module provides functionality for generating, finding, and replacing
 * tables of contents in RFC documents.
 */

// Export types
export * from './types';

// Export find functions
export {
  findSections,
  findTOCPosition,
  findExistingTOC,
  isSection,
  isMetadata
} from './find';

// Export generate functions
export {
  generateTOCLines,
  generateTOC
} from './generate';

// Export replace functions
export {
  replaceTOC
} from './replace';

// Import dependencies
import { generateTOC } from './generate';
import { findExistingTOC } from './find';
import { replaceTOC } from './replace';

/**
 * Process a document to add or update a table of contents
 * This is a convenience function that combines the three steps
 * @param text - The document text
 * @returns - The document text with a table of contents added or updated
 */
export function processTOC(text: string): string {
  // Step 1: Generate the TOC
  const tocLines = generateTOC(text);
  
  // If no sections found, return the original text
  if (tocLines.length === 0) {
    return text;
  }
  
  // Step 2: Get the current TOC
  const currentTOC = findExistingTOC(text.split('\n'));
  
  // Step 3: Replace or insert the TOC
  return replaceTOC(text, tocLines, currentTOC);
}