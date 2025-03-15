/**
 * Functions for validating document references
 */

import * as path from 'path';
import * as fs from 'fs';
import { DocumentReference, DiagnosticInfo } from './types.js';

/**
 * Validate a document reference
 * @param reference - The reference to validate
 * @param documentDir - The directory of the current document
 * @returns - Diagnostic information if invalid, null if valid
 */
export async function validateReference(
  reference: DocumentReference, 
  documentDir: string
): Promise<DiagnosticInfo | null> {
  // Resolve the file path relative to the current document
  const targetPath = path.resolve(documentDir, reference.filePath);
  
  // Check if the file exists
  if (!fs.existsSync(targetPath)) {
    // File doesn't exist
    return {
      message: `Referenced file not found: ${reference.filePath}`,
      range: reference.range,
      severity: 'error'
    };
  }
  
  // If there's an anchor, check if it exists in the target file
  if (reference.anchor) {
    try {
      const targetContent = fs.readFileSync(targetPath, 'utf8');
      const anchorExists = await checkAnchorExists(targetContent, reference.anchor);
      
      if (!anchorExists) {
        // Anchor doesn't exist in the target file
        return {
          message: `Anchor not found in target file: #${reference.anchor}`,
          range: reference.range,
          severity: 'error'
        };
      }
    } catch (error) {
      // Error reading the target file
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        message: `Error reading target file: ${errorMessage}`,
        range: reference.range,
        severity: 'error'
      };
    }
  }
  
  // Reference is valid
  return null;
}

/**
 * Check if an anchor exists in the target content
 * @param content - The content to check
 * @param anchor - The anchor to look for
 * @returns - Whether the anchor exists
 */
export async function checkAnchorExists(content: string, anchor: string): Promise<boolean> {
  // Convert the anchor to a section title format
  // Anchors are typically in the format "section-name" or "section-1-2"
  const anchorParts = anchor.split('-');
  
  // Check if it's a numbered section (e.g., "section-1-2")
  const isNumberedSection = anchorParts.some(part => /^\d+$/.test(part));
  
  if (isNumberedSection) {
    // Try to match a numbered section
    const sectionNumbers = anchorParts.filter(part => /^\d+$/.test(part));
    const sectionPattern = `^${sectionNumbers.join('\\.')}\\. `;
    const regex = new RegExp(sectionPattern, 'm');
    return regex.test(content);
  } else {
    // Try to match a regular section or alternative section
    // Convert anchor format (e.g., "section-name") to possible section formats
    
    // Convert to uppercase section (e.g., "SECTION NAME")
    const uppercaseSection = anchorParts.join(' ').toUpperCase();
    if (new RegExp(`^${uppercaseSection}$`, 'm').test(content)) {
      return true;
    }
    
    // Convert to alternative section (e.g., ": Section Name")
    const titleCaseSection = anchorParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    if (new RegExp(`^: ${titleCaseSection}$`, 'm').test(content)) {
      return true;
    }
    
    // Try other variations of the section title
    const variations = [
      anchorParts.join(' '), // section name
      anchorParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') // Section Name
    ];
    
    for (const variation of variations) {
      // Check for any section type that contains this text
      if (new RegExp(`^[A-Z][^\\n]*${variation}[^\\n]*$`, 'im').test(content) ||
          new RegExp(`^\\d+(\\.\\d+)*\\. [^\\n]*${variation}[^\\n]*$`, 'im').test(content) ||
          new RegExp(`^: [^\\n]*${variation}[^\\n]*$`, 'im').test(content)) {
        return true;
      }
    }
  }
  
  return false;
}