/**
 * Generate TOC Command - Headless Backend
 * 
 * This module provides functionality for generating a table of contents
 * in the headless backend environment.
 */

import { processTOC } from '../../../features/toc';
import { findSections } from '../../../features/toc';
/**
 * Command result interface
 * This interface defines the shape of the result returned by command functions
 */
interface CommandResult<T> {
  success: boolean;
  result?: T;
  error?: any;
}

/**
 * Generate a table of contents for a document
 * @param text - The document text
 * @param filePath - The path of the document
 * @returns - The result of the TOC generation
 */
export async function generateTOCCommand(
  text: string,
  filePath: string
): Promise<CommandResult<string>> {
  // Only process RFC files
  if (!filePath.endsWith('.rfc')) {
    return {
      success: false,
      error: 'Generate TOC command is only available for .rfc files'
    };
  }

  try {
    // Check if the document has any sections
    const sections = findSections(text);
    
    // Check if the document has any numbered sections (e.g., "1. INTRODUCTION")
    const numberedSections = sections.filter(section => section.prefix && section.prefix.match(/^\d+(\.\d+)*\.$/));
    if (numberedSections.length === 0) {
      return {
        success: false,
        error: 'No sections found to generate TOC'
      };
    }
    
    // Generate the TOC
    const newText = processTOC(text);
    
    return {
      success: true,
      result: newText
    };
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error generating TOC: ${errorMessage}`
    };
  }
}