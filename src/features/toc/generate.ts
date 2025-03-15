/**
 * Functions for generating TOC content
 */

import { Section } from './types.js';
import { findSections } from './find.js';

/**
 * Generate TOC lines based on the sections
 * @param sections - The sections
 * @returns - The TOC lines
 */
export function generateTOCLines(sections: Section[]): string[] {
  const tocLines = [
    'TABLE OF CONTENTS',
    '-----------------',
    ''
  ];
  
  for (const section of sections) {
    // Add indentation for subsections (single level of indentation)
    const indent = section.level > 1 ? '    ' : '';
    
    // Add the section to the TOC
    tocLines.push(`${indent}${section.name.trim()}`);
  }
  
  return tocLines;
}

/**
 * Generate a table of contents for an RFC document
 * @param text - The document text
 * @returns - The TOC lines as an array of strings, or empty array if no sections found
 */
export function generateTOC(text: string): string[] {
  // Find all sections in the document
  const sections = findSections(text);
  
  if (sections.length === 0) {
    return []; // No sections found, return empty array
  }
  
  // Generate the TOC lines
  return generateTOCLines(sections);
}