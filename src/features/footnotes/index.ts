/**
 * Footnotes Feature
 * 
 * This feature provides functionality for processing footnotes in RFC documents.
 * It allows for renumbering footnotes sequentially and updating all references.
 */

// Export types
export * from './types';

// Export core functionality
export * from './process';

// Re-export the main function for convenience
import { processFootnotes } from './process';
export default processFootnotes;