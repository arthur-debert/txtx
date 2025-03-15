/**
 * Reference Commands - Headless Backend
 * 
 * This module provides functionality for checking document references
 * in the headless backend environment.
 */

import * as path from 'path';
import { checkReferences, ReferenceCheckResult } from '../../../features/index.js';

/**
 * Check references in a document
 * @param text - The document text
 * @param filePath - The path of the document
 * @returns - The result of the reference check
 */
export async function checkDocumentReferences(
  text: string,
  filePath: string
): Promise<ReferenceCheckResult> {
  // Only process RFC files
  if (!filePath.endsWith('.rfc')) {
    return {
      success: false,
      diagnostics: [{
        message: 'Check References command is only available for .rfc files',
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 }
        },
        severity: 'warning'
      }],
      referencesFound: 0
    };
  }

  try {
    // Get the directory of the document
    const documentDir = path.dirname(filePath);
    
    // Check references
    const result = await checkReferences(text, documentDir);
    
    return result;
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      diagnostics: [{
        message: `Error checking references: ${errorMessage}`,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 }
        },
        severity: 'error'
      }],
      referencesFound: 0
    };
  }
}