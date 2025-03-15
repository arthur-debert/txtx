/**
 * Headless Backend - Diagnostics and Notifications Features
 * This file contains implementations for Diagnostic, DiagnosticCollection, and OutputChannel
 */

import {
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticCollection,
  OutputChannel,
  Uri,
  Range
} from '../../types.js';

/**
 * Diagnostic implementation for headless backend
 * Represents a diagnostic, such as a compiler error or warning
 */
export class HeadlessDiagnostic implements Diagnostic {
  range: Range;
  message: string;
  severity: DiagnosticSeverity;
  source?: string;
  code?: string | number;

  constructor(range: Range, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error, source?: string, code?: string | number) {
    this.range = range;
    this.message = message;
    this.severity = severity;
    this.source = source;
    this.code = code;
  }
}

/**
 * DiagnosticCollection implementation for headless backend
 * Manages a collection of diagnostics for documents
 */
export class HeadlessDiagnosticCollection implements DiagnosticCollection {
  name: string;
  private _diagnostics: Map<string, Diagnostic[]> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Set diagnostics for a document
   * @param uri The document URI
   * @param diagnostics The diagnostics to set
   */
  set(uri: Uri, diagnostics: Diagnostic[]): void {
    this._diagnostics.set(uri.toString(), diagnostics);
  }

  /**
   * Delete diagnostics for a document
   * @param uri The document URI
   */
  delete(uri: Uri): void {
    this._diagnostics.delete(uri.toString());
  }

  /**
   * Clear all diagnostics
   */
  clear(): void {
    this._diagnostics.clear();
  }

  /**
   * Dispose the diagnostic collection
   */
  dispose(): void {
    this._diagnostics.clear();
  }

  /**
   * Get diagnostics for a document
   * @param uri The document URI
   * @returns The diagnostics for the document
   */
  get(uri: Uri): Diagnostic[] | undefined {
    return this._diagnostics.get(uri.toString());
  }

  /**
   * Get all diagnostics
   * @returns An iterator of [Uri, Diagnostic[]] pairs
   */
  entries(): [Uri, Diagnostic[]][] {
    const result: [Uri, Diagnostic[]][] = [];
    this._diagnostics.forEach((diagnostics, uriString) => {
      // Create a mock Uri object
      const uri = {
        toString: () => uriString
      } as Uri;
      result.push([uri, diagnostics]);
    });
    return result;
  }
}

/**
 * OutputChannel implementation for headless backend
 * Provides a channel for output messages
 */
export class HeadlessOutputChannel implements OutputChannel {
  name: string;
  private _lines: string[] = [];
  private _isVisible: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Append text to the output channel
   * @param value The text to append
   */
  append(value: string): void {
    // In a headless environment, we'll log to console
    process.stdout.write(`[${this.name}] ${value}`);
    this._lines.push(value);
  }

  /**
   * Append a line to the output channel
   * @param value The line to append
   */
  appendLine(value: string): void {
    console.log(`[${this.name}] ${value}`);
    this._lines.push(value + '\n');
  }

  /**
   * Clear the output channel
   */
  clear(): void {
    this._lines = [];
  }

  /**
   * Show the output channel
   */
  show(): void {
    this._isVisible = true;
  }

  /**
   * Hide the output channel
   */
  hide(): void {
    this._isVisible = false;
  }

  /**
   * Dispose the output channel
   */
  dispose(): void {
    this._lines = [];
    this._isVisible = false;
  }

  /**
   * Get the content of the output channel
   * @returns The content of the output channel
   */
  getContent(): string {
    return this._lines.join('');
  }

  /**
   * Check if the output channel is visible
   * @returns True if the output channel is visible
   */
  isVisible(): boolean {
    return this._isVisible;
  }
}