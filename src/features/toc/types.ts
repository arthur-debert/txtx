/**
 * Types for the TOC feature
 */

/**
 * Interface for section information
 */
export interface Section {
  name: string;
  level: number;
  line: number;
  prefix: string;
}

/**
 * Interface for TOC location in a document
 */
export interface TOCLocation {
  startLine: number;
  endLine: number;
}