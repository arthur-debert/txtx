/**
 * Headless Backend - Workspace and Resource Management Features
 * This file contains implementations for Workspace and WorkspaceFolder
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Uri,
  TextDocument,
  WorkspaceEdit,
  WorkspaceFolder,
  Position,
  TextLine,
} from '../../types.js';
import { HeadlessUri, HeadlessPosition, HeadlessRange } from './document-text.js';
import { applyTextEdit } from './document-text.js';

/**
 * Workspace implementation for headless backend
 * Provides workspace-related functionality
 */
export class HeadlessWorkspace {
  private _documents: Map<string, TextDocument> = new Map();
  private _workspaceFolders: WorkspaceFolder[] = [];

  constructor() {
    // Initialize with a default workspace folder if needed
    this._workspaceFolders.push({
      uri: HeadlessUri.file(process.cwd()),
      name: path.basename(process.cwd()),
      index: 0,
    });
  }

  /**
   * Open a text document
   * @param uriOrPath The URI or path of the document to open
   * @returns A promise that resolves to the opened document
   */
  async openTextDocument(uriOrPath: Uri | string): Promise<TextDocument> {
    // If it's a string, treat it as a path
    const filePath = typeof uriOrPath === 'string' ? uriOrPath : uriOrPath.fsPath;

    // Check if we already have this document
    if (this._documents.has(filePath)) {
      return this._documents.get(filePath) as TextDocument;
    }

    // Try to read the file if it exists
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      // File doesn't exist or can't be read, create an empty document
      console.warn(`Could not read file: ${filePath}`, error);
    }

    // Create a new document
    const uri = typeof uriOrPath === 'string' ? HeadlessUri.file(uriOrPath) : uriOrPath;
    const languageId = filePath.endsWith('.rfc') ? 'txxt' : 'plaintext';

    const document = this._createTextDocument(content, uri, languageId);
    this._documents.set(filePath, document);
    return document;
  }

  /**
   * Apply a workspace edit
   * @param edit The workspace edit to apply
   * @returns A promise that resolves to true if the edit was applied successfully
   */
  async applyEdit(edit: WorkspaceEdit): Promise<boolean> {
    try {
      // Apply the edit to the appropriate documents
      for (const [uri, edits] of edit.entries()) {
        const document = this._documents.get(uri.fsPath);
        if (document) {
          for (const textEdit of edits) {
            // Apply the edit to the document
            applyTextEdit(document, textEdit);
          }
        } else {
          console.warn(`Document not found for URI: ${uri.fsPath}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error applying workspace edit:', error);
      return false;
    }
  }

  /**
   * Get the workspace folder that contains the given URI
   * @param uri The URI to get the workspace folder for
   * @returns The workspace folder that contains the URI, or undefined if none
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWorkspaceFolder(_uri: Uri): WorkspaceFolder | undefined {
    // Simple implementation that returns the first workspace folder
    // In a real implementation, we would check if the URI is contained in any workspace folder
    return this._workspaceFolders[0];
  }

  /**
   * Get all workspace folders
   * @returns An array of workspace folders
   */
  getWorkspaceFolders(): WorkspaceFolder[] {
    return this._workspaceFolders;
  }

  /**
   * Add a workspace folder
   * @param uri The URI of the folder to add
   * @param name The name of the folder
   */
  addWorkspaceFolder(uri: Uri, name: string): void {
    this._workspaceFolders.push({
      uri,
      name,
      index: this._workspaceFolders.length,
    });
  }

  /**
   * Remove a workspace folder
   * @param uri The URI of the folder to remove
   */
  removeWorkspaceFolder(uri: Uri): void {
    const index = this._workspaceFolders.findIndex(folder => folder.uri.fsPath === uri.fsPath);
    if (index !== -1) {
      this._workspaceFolders.splice(index, 1);
      // Update indices
      for (let i = 0; i < this._workspaceFolders.length; i++) {
        this._workspaceFolders[i].index = i;
      }
    }
  }

  /**
   * Create a text document
   * @param content The content of the document
   * @param uri The URI of the document
   * @param languageId The language ID of the document
   * @returns The created text document
   */
  private _createTextDocument(content: string, uri: Uri, languageId: string): TextDocument {
    // This is a simplified implementation
    // In a real implementation, we would create a proper TextDocument object
    return {
      getText: () => content,
      lineAt: (lineOrPosition: number | Position): TextLine => {
        const lines = content.split('\n');
        const lineNumber =
          typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
        if (lineNumber < 0 || lineNumber >= lines.length) {
          throw new Error(`Line number out of range: ${lineNumber}`);
        }
        const text = lines[lineNumber];
        return {
          text: text,
          lineNumber: lineNumber,
          range: new HeadlessRange(lineNumber, 0, lineNumber, text.length),
          rangeIncludingLineBreak: new HeadlessRange(lineNumber, 0, lineNumber, text.length + 1),
          firstNonWhitespaceCharacterIndex:
            text.search(/\S/) === -1 ? text.length : text.search(/\S/),
          isEmptyOrWhitespace: text.trim().length === 0,
        };
      },
      positionAt: (offset: number): Position => {
        const contentLines = content.split('\n');
        let lineNum = 0;
        let charNum = 0;
        let currentPos = 0;

        while (currentPos <= offset && lineNum < contentLines.length) {
          if (currentPos + contentLines[lineNum].length + 1 > offset) {
            charNum = offset - currentPos;
            break;
          }
          currentPos += contentLines[lineNum].length + 1; // +1 for the newline
          lineNum++;
        }

        return new HeadlessPosition(lineNum, charNum);
      },
      offsetAt: (position: Position): number => {
        const contentLines = content.split('\n');
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
          offset += (contentLines[i] || '').length + 1; // +1 for the newline
        }
        offset += position.character;
        return offset;
      },
      lineCount: content.split('\n').length,
      languageId,
      uri,
      fileName: uri.fsPath,
      version: 1,
      isDirty: false,
      isClosed: false,
      save: async () => true,
    };
  }
}
