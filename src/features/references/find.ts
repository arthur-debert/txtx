/**
 * Functions for finding references in documents
 */

import { DocumentReference } from './types.js';
import { DOCUMENT_REFERENCE_REGEX } from '../../extension/constants.js';

/**
 * Find all document references in the given text
 * @param text - The document text to search
 * @returns - Array of document references found
 */
export function findDocumentReferences(text: string): DocumentReference[] {
  const references: DocumentReference[] = [];
  let match;
  
  // Reset the regex lastIndex
  DOCUMENT_REFERENCE_REGEX.lastIndex = 0;
  
  while ((match = DOCUMENT_REFERENCE_REGEX.exec(text)) !== null) {
    const filePath = match[1];
    const anchor = match[2] || '';
    
    // Calculate position in the document
    const beforeMatchText = text.substring(0, match.index);
    const lines = beforeMatchText.split('\n');
    const line = lines.length - 1;
    const character = lines[lines.length - 1].length;
    
    // Calculate the range
    const startPosition = {
      line,
      character
    };
    
    const endPosition = {
      line,
      character: character + match[0].length
    };
    
    references.push({
      filePath,
      anchor,
      position: startPosition,
      range: {
        start: startPosition,
        end: endPosition
      }
    });
  }
  
  return references;
}

/**
 * Get the position at a specific offset in the text
 * @param text - The document text
 * @param offset - The character offset
 * @returns - The position (line and character)
 */
export function getPositionAt(text: string, offset: number): { line: number; character: number } {
  const textBefore = text.substring(0, offset);
  const lines = textBefore.split('\n');
  
  return {
    line: lines.length - 1,
    character: lines[lines.length - 1].length
  };
}