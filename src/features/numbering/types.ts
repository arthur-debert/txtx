/**
 * Types for the Numbering feature
 */

/**
 * Interface for numbering fix result
 */
export interface NumberingFixResult {
  success: boolean;
  error?: string;
  linesChanged: number;
  fixedText?: string;
}