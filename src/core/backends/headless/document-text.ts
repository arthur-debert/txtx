/**
 * Headless Backend - Document and Text Manipulation Features
 * This file contains implementations for Position, Range, Selection, TextDocument, TextLine, TextEditor, and related classes
 */

import {
  Position,
  Range,
  Selection,
  TextLine,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  TextEditorDecorationType,
  WorkspaceEdit,
  TextEdit,
  Uri,
} from '../../types';

/**
 * Position class implementation for headless backend
 */
export class HeadlessPosition implements Position {
  line: number;
  character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  with(change: { line?: number; character?: number } = {}): Position {
    return new HeadlessPosition(
      change.line !== undefined ? change.line : this.line,
      change.character !== undefined ? change.character : this.character
    );
  }

  isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }

  isBefore(other: Position): boolean {
    if (this.line < other.line) {
      return true;
    }
    if (this.line === other.line && this.character < other.character) {
      return true;
    }
    return false;
  }

  isAfter(other: Position): boolean {
    if (this.line > other.line) {
      return true;
    }
    if (this.line === other.line && this.character > other.character) {
      return true;
    }
    return false;
  }

  translate(lineDelta: number = 0, characterDelta: number = 0): Position {
    return new HeadlessPosition(this.line + lineDelta, this.character + characterDelta);
  }
}

/**
 * Range class implementation for headless backend
 */
export class HeadlessRange implements Range {
  start: Position;
  end: Position;

  constructor(
    startLine: number | Position,
    startCharacter: number | Position,
    endLine?: number,
    endCharacter?: number
  ) {
    if (startLine instanceof HeadlessPosition) {
      this.start = startLine;
      this.end = startCharacter as Position;
    } else {
      this.start = new HeadlessPosition(startLine as number, startCharacter as number);
      this.end = new HeadlessPosition(endLine as number, endCharacter as number);
    }
  }

  contains(positionOrRange: Position | Range): boolean {
    if (
      positionOrRange instanceof HeadlessPosition ||
      ('line' in positionOrRange && 'character' in positionOrRange)
    ) {
      const position = positionOrRange as Position;
      return (
        (position.isAfter(this.start) || position.isEqual(this.start)) &&
        (position.isBefore(this.end) || position.isEqual(this.end))
      );
    }

    if ('start' in positionOrRange && 'end' in positionOrRange) {
      const range = positionOrRange;
      return this.contains(range.start) && this.contains(range.end);
    }

    return false;
  }

  intersection(range: Range): Range | undefined {
    const start = this.start.isBefore(range.start) ? range.start : this.start;
    const end = this.end.isAfter(range.end) ? range.end : this.end;

    if (start.isAfter(end)) {
      return undefined;
    }

    return new HeadlessRange(start, end);
  }

  union(range: Range): Range {
    const start = this.start.isBefore(range.start) ? this.start : range.start;
    const end = this.end.isAfter(range.end) ? this.end : range.end;

    return new HeadlessRange(start, end);
  }

  with(change: { start?: Position; end?: Position } = {}): Range {
    let start = this.start;
    let end = this.end;

    if (change.start !== undefined) {
      start = change.start;
    }

    if (change.end !== undefined) {
      end = change.end;
    }

    if (start === this.start && end === this.end) {
      return this;
    }

    return new HeadlessRange(start, end);
  }

  isEmpty(): boolean {
    return this.start.isEqual(this.end);
  }

  isSingleLine(): boolean {
    return this.start.line === this.end.line;
  }
}

/**
 * Selection class implementation for headless backend
 */
export class HeadlessSelection implements Selection {
  start: Position;
  end: Position;
  anchor: Position;
  active: Position;

  constructor(
    anchorLine: number | Position,
    anchorCharacter: number | Position,
    activeLine?: number,
    activeCharacter?: number
  ) {
    if (anchorLine instanceof HeadlessPosition) {
      this.anchor = anchorLine;
      this.active = anchorCharacter as Position;
      this.start = this.anchor.isBefore(this.active) ? this.anchor : this.active;
      this.end = this.anchor.isBefore(this.active) ? this.active : this.anchor;
    } else {
      this.anchor = new HeadlessPosition(anchorLine as number, anchorCharacter as number);
      this.active = new HeadlessPosition(activeLine as number, activeCharacter as number);
      this.start = this.anchor.isBefore(this.active) ? this.anchor : this.active;
      this.end = this.anchor.isBefore(this.active) ? this.active : this.anchor;
    }
  }

  isReversed(): boolean {
    return this.anchor.isAfter(this.active);
  }

  with(change: { anchor?: Position; active?: Position } = {}): Selection {
    let anchor = this.anchor;
    let active = this.active;

    if (change.anchor !== undefined) {
      anchor = change.anchor;
    }

    if (change.active !== undefined) {
      active = change.active;
    }

    if (anchor === this.anchor && active === this.active) {
      return this;
    }

    return new HeadlessSelection(anchor, active);
  }

  // Implement Range methods
  contains(positionOrRange: Position | Range): boolean {
    if (
      positionOrRange instanceof HeadlessPosition ||
      ('line' in positionOrRange && 'character' in positionOrRange)
    ) {
      const position = positionOrRange as Position;
      return (
        (position.isAfter(this.start) || position.isEqual(this.start)) &&
        (position.isBefore(this.end) || position.isEqual(this.end))
      );
    }

    if ('start' in positionOrRange && 'end' in positionOrRange) {
      const range = positionOrRange;
      return this.contains(range.start) && this.contains(range.end);
    }

    return false;
  }

  intersection(range: Range): Range | undefined {
    const start = this.start.isBefore(range.start) ? range.start : this.start;
    const end = this.end.isAfter(range.end) ? range.end : this.end;

    if (start.isAfter(end)) {
      return undefined;
    }

    return new HeadlessRange(start, end);
  }

  union(range: Range): Range {
    const start = this.start.isBefore(range.start) ? this.start : range.start;
    const end = this.end.isAfter(range.end) ? this.end : range.end;

    return new HeadlessRange(start, end);
  }

  isEmpty(): boolean {
    return this.start.isEqual(this.end);
  }

  isSingleLine(): boolean {
    return this.start.line === this.end.line;
  }
}

/**
 * TextLine class implementation for headless backend
 */
export class HeadlessTextLine implements TextLine {
  text: string;
  lineNumber: number;
  range: Range;
  rangeIncludingLineBreak: Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;

  constructor(text: string, lineNumber: number, range: Range) {
    this.text = text;
    this.lineNumber = lineNumber;
    this.range = range;
    this.rangeIncludingLineBreak = new HeadlessRange(
      range.start,
      new HeadlessPosition(lineNumber, text.length + 1)
    );
    this.firstNonWhitespaceCharacterIndex = this._getFirstNonWhitespaceIndex();
    this.isEmptyOrWhitespace = this.firstNonWhitespaceCharacterIndex === -1;
  }

  private _getFirstNonWhitespaceIndex(): number {
    for (let i = 0; i < this.text.length; i++) {
      if (!/\s/.test(this.text[i])) {
        return i;
      }
    }
    return -1;
  }
}

/**
 * Create a text document
 * @param content The content of the document
 * @param uri The URI of the document
 * @param languageId The language ID of the document
 * @returns The created text document
 */
export function createTextDocument(
  content: string = '',
  uri: any = {},
  languageId: string = 'txxt'
): TextDocument {
  const lines = content.split('\n');
  const documentUri =
    uri instanceof HeadlessUri
      ? uri
      : new HeadlessUri('file', '', uri.path || '/mock/document.rfc', '', '');

  const document: TextDocument = {
    getText: (): string => content,

    lineAt: (line: number | Position): TextLine => {
      if (typeof line === 'number') {
        if (line < 0 || line >= lines.length) {
          throw new Error(`Line number out of range: ${line}`);
        }

        const text = lines[line];
        const range = new HeadlessRange(line, 0, line, text.length);
        return new HeadlessTextLine(text, line, range);
      } else {
        // Handle Position
        return document.lineAt(line.line);
      }
    },

    positionAt: (offset: number): Position => {
      // Calculate position from offset
      let line = 0;
      let char = 0;
      let currentOffset = 0;

      while (currentOffset <= offset && line < lines.length) {
        if (currentOffset + lines[line].length + 1 > offset) {
          char = offset - currentOffset;
          break;
        }
        currentOffset += lines[line].length + 1; // +1 for the newline
        line++;
      }

      return new HeadlessPosition(line, char);
    },

    offsetAt: (position: Position): number => {
      // Calculate offset from position
      let offset = 0;
      for (let i = 0; i < position.line; i++) {
        offset += (lines[i] || '').length + 1; // +1 for the newline
      }
      offset += position.character;
      return offset;
    },

    lineCount: lines.length,
    languageId,
    uri: documentUri,
    fileName: documentUri.fsPath,
    version: 1,
    isDirty: false,
    isClosed: false,
    save: async (): Promise<boolean> => true,
  };

  return document;
}

/**
 * Create a text editor
 * @param document The document to create an editor for
 * @returns The created text editor
 */
export function createTextEditor(document: TextDocument): TextEditor {
  return {
    document,
    selection: new HeadlessSelection(0, 0, 0, 0),
    selections: [new HeadlessSelection(0, 0, 0, 0)],
    visibleRanges: [new HeadlessRange(0, 0, document.lineCount - 1, 0)],

    edit: async (callback: (editBuilder: TextEditorEdit) => void): Promise<boolean> => {
      const editBuilder: TextEditorEdit = {
        replace: (range: Range, text: string): void => {
          // Apply the replacement to the document
          applyTextEdit(document, { range, newText: text });
        },

        insert: (position: Position, text: string): void => {
          // Apply the insertion to the document
          applyTextEdit(document, {
            range: new HeadlessRange(position, position),
            newText: text,
          });
        },

        delete: (range: Range): void => {
          // Apply the deletion to the document
          applyTextEdit(document, { range, newText: '' });
        },
      };

      callback(editBuilder);
      return true;
    },

    setDecorations: (decorationType: TextEditorDecorationType, ranges: Range[]): void => {
      // Store decorations for the document
      if (!(document as any)._decorations) {
        (document as any)._decorations = new Map();
      }
      (document as any)._decorations.set(decorationType.id, ranges);
    },
  };
}

/**
 * Apply a text edit to a document
 * @param document The document to apply the edit to
 * @param textEdit The text edit to apply
 */
export function applyTextEdit(document: TextDocument, textEdit: TextEdit): void {
  // Get the current content
  const content = document.getText();

  // Calculate the offsets
  const startOffset = document.offsetAt(textEdit.range.start);
  const endOffset = document.offsetAt(textEdit.range.end);

  // Apply the edit
  const newContent =
    content.substring(0, startOffset) + textEdit.newText + content.substring(endOffset);

  // Update the document
  const lines = newContent.split('\n');

  // Update document properties
  (document as any).getText = () => newContent;
  (document as any).lineCount = lines.length;
  (document as any).lineAt = (line: number | Position): TextLine => {
    if (typeof line === 'number') {
      if (line < 0 || line >= lines.length) {
        throw new Error(`Line number out of range: ${line}`);
      }

      const text = lines[line];
      const range = new HeadlessRange(line, 0, line, text.length);
      return new HeadlessTextLine(text, line, range);
    } else {
      // Handle Position
      return document.lineAt(line.line);
    }
  };
}

/**
 * Uri class implementation for headless backend
 */
export class HeadlessUri implements Uri {
  scheme: string;
  authority: string;
  path: string;
  query: string;
  fragment: string;
  fsPath: string;

  constructor(scheme: string, authority: string, path: string, query: string, fragment: string) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
    this.fsPath = this._getFsPath();
  }

  private _getFsPath(): string {
    if (this.scheme === 'file') {
      return this.path;
    }
    return '';
  }

  with(
    change: {
      scheme?: string;
      authority?: string;
      path?: string;
      query?: string;
      fragment?: string;
    } = {}
  ): Uri {
    return new HeadlessUri(
      change.scheme !== undefined ? change.scheme : this.scheme,
      change.authority !== undefined ? change.authority : this.authority,
      change.path !== undefined ? change.path : this.path,
      change.query !== undefined ? change.query : this.query,
      change.fragment !== undefined ? change.fragment : this.fragment
    );
  }

  toString(): string {
    let result = '';

    if (this.scheme) {
      result += this.scheme + ':';
    }

    if (this.authority || this.scheme === 'file') {
      result += '//';
    }

    if (this.authority) {
      result += this.authority;
    }

    if (this.path) {
      result += this.path;
    }

    if (this.query) {
      result += '?' + this.query;
    }

    if (this.fragment) {
      result += '#' + this.fragment;
    }

    return result;
  }

  static file(path: string): Uri {
    return new HeadlessUri('file', '', path, '', '');
  }

  static parse(value: string): Uri {
    // Simple implementation for common cases
    if (value.startsWith('file://')) {
      return HeadlessUri.file(value.substring(7));
    }

    // For other schemes, a more complex implementation would be needed
    throw new Error('Uri parsing not fully implemented');
  }
}
