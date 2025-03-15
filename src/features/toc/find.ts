/**
 * Functions for finding sections and TOC in a document
 */

import { Section, TOCLocation } from './types';
import { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } from '../../extension/constants';

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
export function findExistingTOC(lines: string[]): TOCLocation | null {
  // Look for "TABLE OF CONTENTS" header
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'TABLE OF CONTENTS') {
      // Found TOC header
      const startLine = i;
      
      // Find the end of the TOC
      let endLine = startLine;
      for (let j = startLine + 1; j < lines.length; j++) {
        if (lines[j].trim() === '' && j + 1 < lines.length && isSection(lines[j + 1].trim())) {
          // Found a blank line followed by a section
          endLine = j;
          break;
        }
        endLine = j;
      }
      
      return { startLine, endLine };
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