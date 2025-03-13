/**
 * Headless Backend - Format Commands
 * This file contains implementations for format-related commands
 */

import { processTOC } from '../../../features/toc';
import processFootnotes from '../../../features/footnotes';

/**
 * Command implementations for formatting operations
 */
export const formatCommands = {
  /**
   * Generate a table of contents for a document
   * @param text - The document text
   * @returns - The document text with a table of contents added or updated
   */
  generateTOC: processTOC,

  /**
   * Number footnotes sequentially and update references
   * @param text - The document text
   * @returns - The document text with footnotes numbered sequentially
   */
  numberFootnotes: (text: string) => processFootnotes(text).newText || text
};