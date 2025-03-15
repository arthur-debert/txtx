/**
 * Numbering Commands - Headless Backend
 * 
 * This module provides functionality for fixing document numbering
 * in the headless backend environment.
 */

import { fixNumbering, NumberingFixResult } from '../../../features/index.js';

/**
 * Fix numbering in a document
 * @param text - The document text
 * @param filePath - The path of the document
 * @returns - The result of the numbering fix
 */
export async function fixDocumentNumbering(
  text: string,
  filePath: string
): Promise<NumberingFixResult> {
  // Only process RFC files
  if (!filePath.endsWith('.rfc')) {
    return {
      success: false,
      error: 'Fix Numbering command is only available for .rfc files',
      linesChanged: 0
    };
  }

  try {
    // Fix numbering using the feature
    const result = fixNumbering(text);
    
    return result;
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