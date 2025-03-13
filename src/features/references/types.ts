/**
 * Types for the References feature
 */

/**
 * Interface for document reference
 */
export interface DocumentReference {
  filePath: string;
  anchor: string;
  position: {
    line: number;
    character: number;
  };
  range: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
}

/**
 * Interface for diagnostic information
 */
export interface DiagnosticInfo {
  message: string;
  range: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
  severity: 'error' | 'warning' | 'information' | 'hint';
}

/**
 * Interface for reference check result
 */
export interface ReferenceCheckResult {
  success: boolean;
  diagnostics: DiagnosticInfo[];
  referencesFound: number;
}