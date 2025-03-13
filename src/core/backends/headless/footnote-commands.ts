/**
 * Footnote Commands - Headless Backend
 * 
 * This module provides functionality for processing footnotes
 * in the headless backend environment.
 */

import processFootnotes, { FootnoteProcessResult } from '../../../features/footnotes';

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
 * Number footnotes sequentially and update references
 * @param text - The document text
 * @param filePath - The path of the document
 * @returns - The result of the footnote processing
 */
export async function numberFootnotes(
  text: string,
  filePath: string
): Promise<CommandResult<string>> {
  // Only process RFC files
  if (!filePath.endsWith('.rfc')) {
    return {
      success: false,
      error: 'Number Footnotes command is only available for .rfc files'
    };
  }

  try {
    // Process footnotes using the feature
    const result = processFootnotes(text);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }
    
    return {
      success: true,
      result: result.newText || text
    };
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error numbering footnotes: ${errorMessage}`
    };
  }
}