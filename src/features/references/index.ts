/**
 * References Feature
 * 
 * This module provides functionality for finding and validating
 * document references in RFC documents.
 */

// Export types
export * from './types.js';

// Export find functions
export {
  findDocumentReferences,
  getPositionAt
} from './find.js';

// Export validate functions
export {
  validateReference,
  checkAnchorExists
} from './validate.js';

// Import dependencies
import { findDocumentReferences } from './find.js';
import { validateReference } from './validate.js';
import { DiagnosticInfo, ReferenceCheckResult } from './types.js';

/**
 * Check all references in a document
 * @param text - The document text
 * @param documentDir - The directory of the document
 * @returns - The result of the reference check
 */
export async function checkReferences(text: string, documentDir: string): Promise<ReferenceCheckResult> {
  try {
    // Find all document references
    const references = findDocumentReferences(text);
    
    // If no references found, return success
    if (references.length === 0) {
      return {
        success: true,
        diagnostics: [],
        referencesFound: 0
      };
    }
    
    // Validate each reference
    const diagnostics: DiagnosticInfo[] = [];
    
    for (const ref of references) {
      const diagnostic = await validateReference(ref, documentDir);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }
    
    // Return the result
    return {
      success: true,
      diagnostics,
      referencesFound: references.length
    };
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