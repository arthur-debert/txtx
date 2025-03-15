/**
 * Footnotes Feature
 * 
 * This feature provides functionality for processing footnotes in RFC documents.
 * It allows for renumbering footnotes sequentially and updating all references.
 */

// Export types
export * from './types.js';

// Export core functionality
export * from './process.js';

// Re-export the main function for convenience
export { processFootnotes } from './process.js';