/**
 * API Extensions
 * This file extends the core API with additional functions
 */

import { TextDocument } from './types';
import { BackendManager } from './backend-manager';

/**
 * Fix numbering in ordered lists and section headers
 * @param document - The document to fix numbering in
 * @returns - Whether the numbering fix was successful
 */
export async function fixNumbering(document: TextDocument): Promise<boolean> {
  // Forward to the current backend
  if (BackendManager.current.fixNumbering) {
    return await BackendManager.current.fixNumbering(document);
  }
  
  // If the backend doesn't implement this method, return false
  console.error('Current backend does not implement fixNumbering');
  return false;
}