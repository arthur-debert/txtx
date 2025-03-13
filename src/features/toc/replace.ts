/**
 * Functions for replacing or inserting TOC in a document
 */

import { TOCLocation } from './types';
import { findTOCPosition } from './find';

/**
 * Replace or insert a TOC in the document
 * @param text - The document text
 * @param tocLines - The TOC lines to insert
 * @param currentTOC - The current TOC information, if any
 * @returns - The document text with a table of contents added or updated
 */
export function replaceTOC(text: string, tocLines: string[], currentTOC: TOCLocation | null): string {
  // Split text into lines
  const lines = text.split('\n');
  
  // If no TOC lines provided, return the original text
  if (tocLines.length === 0) {
    return text;
  }
  
  // Create a new array of lines with TOC inserted/replaced
  let resultLines: string[];
  
  if (currentTOC) {
    // Replace existing TOC
    resultLines = [
      ...lines.slice(0, currentTOC.startLine),
      ...tocLines,
      ...lines.slice(currentTOC.endLine + 1)
    ];
  } else {
    // Insert new TOC
    const tocPosition = findTOCPosition(lines);
    resultLines = [
      ...lines.slice(0, tocPosition),
      ...tocLines,
      '', // Empty line after TOC
      ...lines.slice(tocPosition)
    ];
  }
  
  // Join lines back into a string
  return resultLines.join('\n');
}