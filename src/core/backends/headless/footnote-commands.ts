/**
 * Footnote Commands - Headless Backend
 * 
 * This module provides functionality for processing footnotes
 * in the headless backend environment.
 */

import { processFootnotes } from '../../../features/index.js';
import { CommandResult, ErrorCode, createSuccess, createFailure } from '../../error-utils.js';

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
    return createFailure(
      ErrorCode.FILE_TYPE_UNSUPPORTED,
      'Number Footnotes command is only available for .rfc files'
    );
  }

  try {
    // Process footnotes using the feature
    const result = processFootnotes(text);
    
    if (!result.success) {
      return createFailure(
        ErrorCode.PROCESSING_ERROR,
        result.error instanceof Error ? result.error.message : 'Error processing footnotes'
      );
    }
    
    return createSuccess(result.newText || text);
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createFailure(
      ErrorCode.PROCESSING_ERROR,
      `Error numbering footnotes: ${errorMessage}`
    );
  }
}