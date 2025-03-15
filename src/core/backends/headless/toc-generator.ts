/**
 * Headless Backend - Table of Contents Generator
 * This file contains the core logic for generating a table of contents for RFC documents
 */

// Import the regular expressions from constants
import { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } from '../../../extension/constants.js';

/**
 * Interface for section information
 */
export interface Section {
  name: string;
  level: number;
  line: number;
  prefix: string;
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
  return generateTOCLines(sections); // Use the existing function
}

/**
 * Get the current TOC in the document, if any
 * @param text - The document text
 * @returns - The current TOC information or null if none exists
 */
export function getCurrentTOC(text: string): { startLine: number, endLine: number } | null {
  const lines = text.split('\n');
  
  // Check if there's an existing TOC
  return findExistingTOC(lines);
}

/**
 * Replace or insert a TOC in the document
 * @param text - The document text
 * @param tocLines - The TOC lines to insert
 * @param currentTOC - The current TOC information, if any
 * @returns - The document text with a table of contents added or updated
 */
export function replaceTOC(text: string, tocLines: string[], currentTOC: { startLine: number, endLine: number } | null): string {
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

/**
 * Process a document to add or update a table of contents
 * This is a convenience function that combines the three steps
 * @param text - The document text
 * @returns - The document text with a table of contents added or updated
 */
export function processTOC(text: string): string {
  // Step 1: Find all sections in the document
  const sections = findSections(text);
  
  // If no sections found, return the original text
  if (sections.length === 0) {
    return text;
  }
  
  // Generate the TOC lines
  const tocLines = generateTOCLines(sections);
  
  // If no sections found, return the original text
  if (tocLines.length === 0) {
    return text;
  }
  
  // Step 2: Get the current TOC
  const currentTOC = getCurrentTOC(text);
  
  // Step 3: Replace or insert the TOC
  return replaceTOC(text, tocLines, currentTOC);
}

/**
 * Find sections in document text
 * @param text - The document text
 * @returns - The sections
 */
export function findSections(text: string): Section[] {
  const sections: Section[] = [];
  
  // Find uppercase sections
  SECTION_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SECTION_REGEX.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    sections.push({
      name: match[1].trim(),
      level: 1,
      line: lineIndex,
      prefix: ''
    });
  }
  
  // Find numbered sections
  NUMBERED_SECTION_REGEX.lastIndex = 0;
  while ((match = NUMBERED_SECTION_REGEX.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    const sectionNumber = match[1];
    const sectionTitle = match[2].trim();
    const sectionLevel = sectionNumber.split('.').length;
    
    sections.push({
      name: `${sectionNumber}. ${sectionTitle}`,
      level: sectionLevel,
      line: lineIndex,
      prefix: `${sectionNumber}.`
    });
  }
  
  // Find alternative sections
  ALTERNATIVE_SECTION_REGEX.lastIndex = 0;
  while ((match = ALTERNATIVE_SECTION_REGEX.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    sections.push({
      name: `: ${match[1].trim()}`,
      level: 1,
      line: lineIndex,
      prefix: ':'
    });
  }
  
  // Sort sections by line number
  sections.sort((a, b) => a.line - b.line);
  
  return sections;
}

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
 * Find the position to insert the TOC
 * @param lines - The document lines
 * @returns - The line number to insert the TOC
 */
export function findTOCPosition(lines: string[]): number {
  // Look for the end of the metadata section
  let inMetadata = false;
  let metadataEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (isMetadata(line)) {
      inMetadata = true;
      metadataEnd = i;
    } else if (inMetadata && line === '') {
      // End of metadata section
      return metadataEnd + 2;
    }
  }
  
  // If no metadata section, look for the first blank line after the title
  if (lines.length > 2 && lines[1].match(/^-+$/)) {
    // Title with underline
    for (let i = 2; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        return i + 1;
      }
    }
  }
  
  // Default to line 3 (after title)
  return Math.min(3, lines.length);
}

/**
 * Find an existing TOC in the document
 * @param lines - The document lines
 * @returns - The existing TOC or null
 */
export function findExistingTOC(lines: string[]): {startLine: number, endLine: number} | null {
  // Look for "TABLE OF CONTENTS" header
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'TABLE OF CONTENTS') {
      // Found TOC header
      const startLine = i;
      
      // Find the end of the TOC
      let endLine = i + 1;
      while (endLine < lines.length) {
        const line = lines[endLine].trim();
        if (line === '') {
          // Check if the next non-empty line is a section
          let nextNonEmptyLine = '';
          for (let j = endLine + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') {
              nextNonEmptyLine = lines[j].trim();
              break;
            }
          }
          
          if (isSection(nextNonEmptyLine)) {
            return { startLine, endLine: endLine - 1 };
          }
        }
        endLine++;
      }
    }
  }
  
  return null;
}

/**
 * Check if a line is a section header
 * @param line - The line to check
 * @returns - Whether the line is a section header
 */
export function isSection(line: string): boolean {
  // Check for numbered sections (e.g., "1. Section Name")
  if (/^\d+(\.\d+)*\.\s+\S/.test(line)) {
    return true;
  }
  
  // Check for uppercase sections (e.g., "SECTION NAME")
  if (/^[A-Z][A-Z\s-]+$/.test(line)) {
    return true;
  }
  
  // Check for alternative sections (e.g., ": Section Name")
  if (/^:\s+\S/.test(line)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a line is a metadata entry
 * @param line - The line to check
 * @returns - Whether the line is a metadata entry
 */
export function isMetadata(line: string): boolean {
  // Metadata format: "Key          Value"
  return /^[A-Za-z][A-Za-z\s]+\s{2,}[A-Za-z0-9]/.test(line);
}