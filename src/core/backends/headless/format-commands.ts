/**
 * Headless Backend - Format Commands
 * This file contains implementations for format-related commands
 */

import { processTOC } from './toc-generator';

/**
 * Command implementations for formatting operations
 */
export const formatCommands = {
  /**
   * Generate a table of contents for a document
   * @param text - The document text
   * @returns - The document text with a table of contents added or updated
   */
  generateTOC: processTOC
};