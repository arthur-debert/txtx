/**
 * Headless Backend - Format Commands
 * This file contains implementations for format-related commands
 */

import { processTOC, isMetadata } from '../../../features/toc';
import processFootnotes from '../../../features/footnotes';

/**
 * Format lines according to the RFC specification
 * @param lines - The lines to format
 * @returns - The formatted lines
 */
function formatLines(lines: string[]): string[] {
  const formattedLines: string[] = [];
  let skipNextLine = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Skip this line if it was marked to be skipped
    if (skipNextLine) {
      skipNextLine = false;
      continue;
    }
    
    let line = lines[i];
    
    // Trim trailing whitespace 
    line = line.trimRight();
    
    // Check for section headers
    if (isSection(line)) {
      // Ensure there's a blank line before sections (except at the start of the document)
      if (i > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      
      formattedLines.push(line);
      
      // Ensure there's a blank line after section headers
      formattedLines.push('');
      
      // Skip the next line if it's already blank to avoid double blank lines
      if (i < lines.length - 1 && lines[i + 1].trim() === '') {
        skipNextLine = true;
      }
      
      // Continue to the next line
      continue;
    }
    
    // Check for metadata
    if (isMetadata(line)) {
      // Format metadata with consistent spacing
      const [key, value] = splitMetadata(line);
      if (key && value) {
        // Always format metadata with consistent spacing
        formattedLines.push(`${key.padEnd(14)}${value}`);
      } else {
        formattedLines.push(line);
      }
      continue;
    }
    
    // Check for lists
    const listType = getListType(line);
    if (listType !== 'none') {
      formattedLines.push(line);
      continue;
    }
    
    // Check for code blocks (indented with 4 spaces)
    if (line.startsWith('    ') && !line.startsWith('     ')) {
      formattedLines.push(line);
      continue;
    }
    
    // Check for quotes
    if (line.startsWith('>')) {
      formattedLines.push(line);
      continue;
    }
    
    // Handle blank lines
    if (line.trim() === '') {
      formattedLines.push('');
      continue;
    }
    
    // Handle regular text
    formattedLines.push(line);
  }
  
  return formattedLines;
}

/**
 * Check if a line is a section header
 * @param line - The line to check
 * @returns - Whether the line is a section header
 */
function isSection(line: string): boolean {
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
 * Split a metadata line into key and value
 * @param line - The metadata line
 * @returns - The key and value, or null if not a valid metadata line
 */
function splitMetadata(line: string): [string | null, string | null] {
  // Match any line that starts with a word followed by any amount of whitespace
  const match = line.match(/^([A-Za-z][A-Za-z\s]+?)(?:\s+)(.+)$/);
  if (match) {
    return [match[1].trim(), match[2].trim()];
  }
  return [null, null];
}

/**
 * Check if a line is a list item
 * @param line - The line to check
 * @returns - The type of list item ('none', 'bullet', 'numbered', 'lettered', 'roman')
 */
function getListType(line: string): 'none' | 'bullet' | 'numbered' | 'lettered' | 'roman' {
  // Check for bullet lists (e.g., "- Item")
  if (/^\s*-\s+\S/.test(line)) {
    return 'bullet';
  }
  
  // Check for numbered lists (e.g., "1. Item")
  if (/^\s*\d+\.\s+\S/.test(line)) {
    return 'numbered';
  }
  
  // Check for lettered lists (e.g., "a. Item")
  if (/^\s*[a-z]\.\s+\S/.test(line)) {
    return 'lettered';
  }
  
  // Check for roman numeral lists (e.g., "i. Item")
  if (/^\s*[ivxlcdm]+\.\s+\S/.test(line)) {
    return 'roman';
  }
  
  return 'none';
}

/**
 * Format a document according to the RFC specification
 * @param text - The document text to format
 * @returns - The formatted document text
 */
function formatDocument(text: string): string {
  // Get the document text as lines
  const lines = text.split('\n');

  // Apply formatting rules
  const formattedLines = formatLines(lines);

  // Return the formatted text
  return formattedLines.join('\n');
}

/**
 * Apply full formatting to the document
 * @param text - The document text to format
 * @returns - The fully formatted document text
 */
function fullFormatting(text: string): string {
  // Apply all formatting commands in sequence
  let formattedText = formatDocument(text);
  formattedText = processTOC(formattedText);
  formattedText = processFootnotes(formattedText).newText || formattedText;
  
  return formattedText;
}

/**
 * Command implementations for formatting operations
 */
export const formatCommands = {
  /**
   * Format a document according to the RFC specification
   * @param text - The document text
   * @returns - The formatted document text
   */
  formatDocument,

  /**
   * Generate a table of contents for a document
   * @param text - The document text
   * @returns - The document text with a table of contents added or updated
   */
  generateTOC: processTOC,

  /**
   * Number footnotes sequentially and update references
   * @param text - The document text
   * @returns - The document text with footnotes numbered sequentially
   */
  numberFootnotes: (text: string) => processFootnotes(text).newText || text,

  /**
   * Apply full formatting to the document
   * @param text - The document text
   * @returns - The fully formatted document text
   */
  fullFormatting
};