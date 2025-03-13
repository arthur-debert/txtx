/**
 * Full Formatting Command - Headless Backend
 * 
 * This module provides functionality for applying full formatting to documents
 * in the headless backend environment.
 */

import { processTOC } from '../../../features/toc';
import processFootnotes from '../../../features/footnotes';
import { formatDocument } from './format-document-command';
import { CommandResult, ErrorCode, createSuccess, createFailure } from '../../error-utils';

/**
 * Apply full formatting to the document
 * @param text - The document text to format
 * @returns - The fully formatted document text
 */
export function fullFormatting(text: string): string {
  // Apply all formatting commands in sequence
  let formattedText = formatDocument(text);
  formattedText = processTOC(formattedText);
  formattedText = processFootnotes(formattedText).newText || formattedText;
  
  return formattedText;
}

/**
 * Apply full formatting to the document
 * @param text - The document text
 * @param filePath - The path of the document
 * @returns - The result of the formatting
 */
export async function fullFormattingCommand(
  text: string,
  filePath: string
): Promise<CommandResult<string>> {
  // Only process RFC files
  if (!filePath.endsWith('.rfc')) {
    return createFailure(
      ErrorCode.FILE_TYPE_UNSUPPORTED,
      'Full Formatting command is only available for .rfc files'
    );
  }

  try {
    // Apply full formatting
    const formattedText = fullFormatting(text);
    
    return createSuccess(formattedText);
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createFailure(
      ErrorCode.PROCESSING_ERROR,
      `Error applying full formatting: ${errorMessage}`
    );
  }
}