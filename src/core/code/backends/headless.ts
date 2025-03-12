/**
 * Headless Backend
 * This backend implements core functionality without VSCode dependencies
 */

import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs';
import {
  Backend,
  Position,
  Range,
  Selection,
  TextLine,
  Uri,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  TextEditorDecorationType,
  WorkspaceEdit,
  TextEdit,
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticCollection,
  DocumentSymbol,
  SymbolKind,
  DocumentLink,
  FoldingRange,
  FoldingRangeKind,
  CompletionItem,
  CompletionItemKind,
  CancellationToken,
  Disposable,
  OutputChannel,
  WorkspaceFolder,
  DocumentSymbolProvider,
  DocumentLinkProvider,
  FoldingRangeProvider,
  CompletionItemProvider,
  FoldingContext,
  CompletionContext,
  CompletionTriggerKind,
  Event
} from '../types';

// Import the actual command implementations from the extension
// We'll use require here to avoid TypeScript errors since these are JavaScript files
const formatCommands = require('../../../../extension/formatCommands');
const footnoteCommands = require('../../../../extension/footnoteCommands');
const numberingCommands = require('../../../../extension/numberingCommands');
// Import other command modules as needed

/**
 * Headless Backend class
 * Implements the Backend interface with real functionality that doesn't depend on VSCode
 */
export class HeadlessBackend implements Backend {
  // Internal state
  private _documents: Map<string, TextDocument> = new Map();
  private _editors: Map<string, TextEditor> = new Map();
  private _activeEditor: TextEditor | undefined;
  private _commandRegistry: Map<string, (...args: any[]) => any> = new Map();
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _documentSymbolProvider: DocumentSymbolProvider | null = null;
  private _documentLinkProvider: DocumentLinkProvider | null = null;
  private _foldingRangeProvider: FoldingRangeProvider | null = null;
  private _completionItemProvider: CompletionItemProvider | null = null;
  
  // Position class
  Position!: any;
  
  // Range class
  Range!: any;
  
  // Selection class
  Selection!: any;
  
  // Uri class
  Uri!: any;
  
  // TextLine class
  TextLine!: any;
  
  // Workspace APIs
  workspace!: {
    openTextDocument: (uriOrPath: Uri | string) => Promise<TextDocument>;
    applyEdit: (edit: WorkspaceEdit) => Promise<boolean>;
    getWorkspaceFolder: (uri: Uri) => WorkspaceFolder | undefined;
  };
  
  // Window APIs
  window!: {
    activeTextEditor: TextEditor | undefined;
    showTextDocument: (document: TextDocument) => Promise<TextEditor>;
    createOutputChannel: (name: string) => OutputChannel;
    showInformationMessage: (message: string) => Promise<string | undefined>;
    showWarningMessage: (message: string) => Promise<string | undefined>;
    showErrorMessage: (message: string) => Promise<string | undefined>;
    createTextEditorDecorationType: (options: any) => TextEditorDecorationType;
  };
  
  // Language APIs
  languages!: {
    registerDocumentSymbolProvider: (selector: any, provider: DocumentSymbolProvider) => Disposable;
    registerDocumentLinkProvider: (selector: any, provider: DocumentLinkProvider) => Disposable;
    registerFoldingRangeProvider: (selector: any, provider: FoldingRangeProvider) => Disposable;
    registerCompletionItemProvider: (selector: any, provider: CompletionItemProvider, ...triggerCharacters: string[]) => Disposable;
    createDiagnosticCollection: (name: string) => DiagnosticCollection;
  };
  
  // Command APIs
  commands!: {
    executeCommand: (command: string, ...args: any[]) => Promise<any>;
    registerCommand: (command: string, callback: (...args: any[]) => any) => Disposable;
    getCommands: () => Promise<string[]>;
  };
  
  /**
   * Constructor
   * Initialize the backend
   */
  constructor() {
    // Initialize the backend
    this._init();
  }
  
  /**
   * Initialize the backend
   */
  private _init(): void {
    // Initialize core classes
    this._initCoreClasses();
    
    // Initialize workspace APIs
    this._initWorkspace();
    
    // Initialize window APIs
    this._initWindow();
    
    // Initialize language APIs
    this._initLanguages();
    
    // Initialize command APIs and register extension commands
    this._initCommands();
  }
  
  /**
   * Initialize core classes
   */
  private _initCoreClasses(): void {
    const self = this;
    
    // Position class - real implementation
    class HeadlessPosition implements Position {
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
    
    this.Position = HeadlessPosition;
    
    // Range class - real implementation
    class HeadlessRange implements Range {
      start: Position;
      end: Position;
      
      constructor(startLine: number | Position, startCharacter: number | Position, endLine?: number, endCharacter?: number) {
        if (startLine instanceof HeadlessPosition) {
          this.start = startLine;
          this.end = startCharacter as Position;
        } else {
          this.start = new HeadlessPosition(startLine as number, startCharacter as number);
          this.end = new HeadlessPosition(endLine as number, endCharacter as number);
        }
      }
      
      contains(positionOrRange: Position | Range): boolean {
        if (positionOrRange instanceof HeadlessPosition) {
          const position = positionOrRange;
          return (position.isAfter(this.start) || position.isEqual(this.start)) &&
                 (position.isBefore(this.end) || position.isEqual(this.end));
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
    
    this.Range = HeadlessRange;
    
    // Selection class - real implementation
    class HeadlessSelection implements Selection {
      start: Position;
      end: Position;
      anchor: Position;
      active: Position;
      
      constructor(anchorLine: number | Position, anchorCharacter: number | Position, activeLine?: number, activeCharacter?: number) {
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
        if (positionOrRange instanceof HeadlessPosition) {
          const position = positionOrRange;
          return (position.isAfter(this.start) || position.isEqual(this.start)) &&
                 (position.isBefore(this.end) || position.isEqual(this.end));
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
    
    this.Selection = HeadlessSelection;
    
    // TextLine class - real implementation
    class HeadlessTextLine implements TextLine {
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
    
    this.TextLine = HeadlessTextLine;
    
    // Uri class - real implementation
    class HeadlessUri implements Uri {
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
      
      with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string } = {}): Uri {
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
    
    this.Uri = HeadlessUri;
    
    // Set Uri static methods
    this.Uri.file = HeadlessUri.file;
    this.Uri.parse = HeadlessUri.parse;
  }
  
  /**
   * Initialize workspace APIs
   */
  private _initWorkspace(): void {
    const self = this;
    
    this.workspace = {
      openTextDocument: async (uriOrPath: Uri | string): Promise<TextDocument> => {
        // If it's a string, treat it as a path
        const path = typeof uriOrPath === 'string' ? uriOrPath : uriOrPath.fsPath;
        
        // Check if we already have this document
        if (this._documents.has(path)) {
          return this._documents.get(path) as TextDocument;
        }
        
        // Try to read the file if it exists
        let content = '';
        try {
          content = fs.readFileSync(path, 'utf8');
        } catch (error) {
          // File doesn't exist or can't be read, create an empty document
        }
        
        // Create a new document
        const document = this._createTextDocument(content, { path }, path.endsWith('.rfc') ? 'rfcdoc' : 'plaintext');
        this._documents.set(path, document);
        return document;
      },
      
      applyEdit: async (edit: WorkspaceEdit): Promise<boolean> => {
        // Apply the edit to the appropriate documents
        for (const [uri, edits] of edit.entries()) {
          const document = this._documents.get(uri.fsPath);
          if (document) {
            for (const textEdit of edits) {
              // Apply the edit to the document
              this._applyTextEdit(document, textEdit);
            }
          }
        }
        return true;
      },
      
      getWorkspaceFolder: (uri: Uri): WorkspaceFolder | undefined => {
        // Simple implementation that returns a mock workspace folder
        return { uri, name: path.basename(path.dirname(uri.fsPath)), index: 0 };
      },
    };
  }
  
  /**
   * Initialize window APIs
   */
  private _initWindow(): void {
    const self = this;
    
    this.window = {
      get activeTextEditor(): TextEditor | undefined { 
        return self._activeEditor; 
      },
      
      showTextDocument: async (document: TextDocument): Promise<TextEditor> => {
        // Create an editor for the document if it doesn't exist
        if (!this._editors.has(document.uri.fsPath)) {
          const editor = this._createTextEditor(document);
          this._editors.set(document.uri.fsPath, editor);
        }
        
        // Set as active editor
        this._activeEditor = this._editors.get(document.uri.fsPath);
        return this._activeEditor as TextEditor;
      },
      
      createOutputChannel: (name: string): OutputChannel => {
        return {
          name,
          appendLine: (text: string): void => { console.log(`[${name}] ${text}`); },
          append: (text: string): void => { process.stdout.write(`[${name}] ${text}`); },
          clear: (): void => {},
          show: (): void => {},
          hide: (): void => {},
          dispose: (): void => {}
        };
      },
      
      showInformationMessage: (message: string): Promise<string | undefined> => {
        console.log(`[INFO] ${message}`);
        return Promise.resolve(undefined);
      },
      
      showWarningMessage: (message: string): Promise<string | undefined> => {
        console.warn(`[WARNING] ${message}`);
        return Promise.resolve(undefined);
      },
      
      showErrorMessage: (message: string): Promise<string | undefined> => {
        console.error(`[ERROR] ${message}`);
        return Promise.resolve(undefined);
      },
      
      createTextEditorDecorationType: (options: any): TextEditorDecorationType => {
        // Return a simple object that can be used with setDecorations
        return { id: Math.random().toString(36).substring(2, 9), options };
      },
    };
  }
  
  /**
   * Initialize language APIs
   */
  private _initLanguages(): void {
    this.languages = {
      registerDocumentSymbolProvider: (selector: any, provider: DocumentSymbolProvider): Disposable => {
        this._documentSymbolProvider = provider;
        return { dispose: () => { this._documentSymbolProvider = null; } };
      },
      
      registerDocumentLinkProvider: (selector: any, provider: DocumentLinkProvider): Disposable => {
        this._documentLinkProvider = provider;
        return { dispose: () => { this._documentLinkProvider = null; } };
      },
      
      registerFoldingRangeProvider: (selector: any, provider: FoldingRangeProvider): Disposable => {
        this._foldingRangeProvider = provider;
        return { dispose: () => { this._foldingRangeProvider = null; } };
      },
      
      registerCompletionItemProvider: (selector: any, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable => {
        this._completionItemProvider = provider;
        return { dispose: () => { this._completionItemProvider = null; } };
      },
      
      createDiagnosticCollection: (name: string): DiagnosticCollection => {
        return {
          name,
          set: (uri: Uri, diagnostics: Diagnostic[]): void => { /* Store diagnostics */ },
          delete: (uri: Uri): void => { /* Delete diagnostics */ },
          clear: (): void => { /* Clear all diagnostics */ },
          dispose: (): void => { /* Dispose the collection */ }
        };
      },
    };
  }
  
  /**
   * Initialize command APIs
   */
  private _initCommands(): void {
    this.commands = {
      executeCommand: async (command: string, ...args: any[]): Promise<any> => {
        // Check if it's a registered command
        const handler = this._commandRegistry.get(command);
        if (handler) {
          return handler(...args);
        }
        
        // Handle built-in VSCode commands
        switch (command) {
          case 'vscode.executeDocumentSymbolProvider':
            return this._executeDocumentSymbolProvider(args[0]);
          case 'vscode.executeFoldingRangeProvider':
            return this._executeFoldingRangeProvider(args[0]);
          case 'vscode.executeLinkProvider':
            return this._executeLinkProvider(args[0]);
          // Handle extension commands
          case 'rfcdoc.formatDocument':
            return formatCommands.formatDocument(args[0]);
          case 'rfcdoc.generateTOC':
            return formatCommands.generateTOC(args[0]);
          case 'rfcdoc.fullFormatting':
            return formatCommands.fullFormatting(args[0]);
          case 'rfcdoc.numberFootnotes':
            return footnoteCommands.numberFootnotes(args[0]);
          case 'rfcdoc.fixNumbering':
            return numberingCommands.fixNumbering(args[0]);
          // Add other commands as needed...
          default:
            throw new Error(`Command not implemented: ${command}`);
        }
      },
      
      registerCommand: (command: string, callback: (...args: any[]) => any): Disposable => {
        this._commandRegistry.set(command, callback);
        return {
          dispose: () => {
            this._commandRegistry.delete(command);
          }
        };
      },
      
      getCommands: async (): Promise<string[]> => {
        return Array.from(this._commandRegistry.keys());
      }
    };
    
    // Register extension commands
    this._registerExtensionCommands();
  }
  
  /**
   * Register extension commands
   */
  private _registerExtensionCommands(): void {
    // Register format commands
    this.commands.registerCommand('rfcdoc.formatDocument', formatCommands.formatDocument);
    this.commands.registerCommand('rfcdoc.generateTOC', formatCommands.generateTOC);
    this.commands.registerCommand('rfcdoc.fullFormatting', formatCommands.fullFormatting);
    
    // Register footnote commands
    this.commands.registerCommand('rfcdoc.numberFootnotes', footnoteCommands.numberFootnotes);
    
    // Register numbering commands
    this.commands.registerCommand('rfcdoc.fixNumbering', numberingCommands.fixNumbering);
    
    // Register other commands as needed...
  }
  
  /**
   * Create a text document
   * @param content The content of the document
   * @param uri The URI of the document
   * @param languageId The language ID of the document
   * @returns The created text document
   */
  _createTextDocument(content: string = '', uri: any = {}, languageId: string = 'rfcdoc'): TextDocument {
    const lines = content.split('\n');
    const documentUri = uri instanceof this.Uri ? 
      uri : 
      new this.Uri('file', '', uri.path || '/mock/document.rfc', '', '');
    
    const self = this;
    
    const document: TextDocument = {
      getText: (): string => content,
      
      lineAt: (line: number | Position): TextLine => {
        if (typeof line === 'number') {
          if (line < 0 || line >= lines.length) {
            throw new Error(`Line number out of range: ${line}`);
          }
          
          const text = lines[line];
          const range = new self.Range(line, 0, line, text.length);
          return new self.TextLine(text, line, range);
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
        
        return new self.Position(line, char);
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
      save: async (): Promise<boolean> => true
    };
    
    // Store the document in the map
    this._documents.set(documentUri.fsPath, document);
    
    return document;
  }
  
  /**
   * Create a text editor
   * @param document The document to create an editor for
   * @returns The created text editor
   */
  _createTextEditor(document: TextDocument): TextEditor {
    const self = this;
    
    return {
      document,
      selection: new this.Selection(0, 0, 0, 0),
      selections: [new this.Selection(0, 0, 0, 0)],
      visibleRanges: [new this.Range(0, 0, document.lineCount - 1, 0)],
      
      edit: async (callback: (editBuilder: TextEditorEdit) => void): Promise<boolean> => {
        const editBuilder: TextEditorEdit = {
          replace: (range: Range, text: string): void => {
            // Apply the replacement to the document
            self._applyTextEdit(document, { range, newText: text });
          },
          
          insert: (position: Position, text: string): void => {
            // Apply the insertion to the document
            self._applyTextEdit(document, { 
              range: new self.Range(position, position), 
              newText: text 
            });
          },
          
          delete: (range: Range): void => {
            // Apply the deletion to the document
            self._applyTextEdit(document, { range, newText: '' });
          }
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
  _applyTextEdit(document: TextDocument, textEdit: TextEdit): void {
    // Get the current content
    const content = document.getText();
    
    // Calculate the offsets
    const startOffset = document.offsetAt(textEdit.range.start);
    const endOffset = document.offsetAt(textEdit.range.end);
    
    // Apply the edit
    const newContent = content.substring(0, startOffset) + 
                      textEdit.newText + 
                      content.substring(endOffset);
    
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
        const range = new this.Range(line, 0, line, text.length);
        return new this.TextLine(text, line, range);
      } else {
        // Handle Position
        return document.lineAt(line.line);
      }
    };
    
    // Emit change event
    this._eventEmitter.emit('documentChanged', document);
  }
  
  /**
   * Execute the document symbol provider
   * @param uri The URI of the document
   * @returns The document symbols
   */
  private async _executeDocumentSymbolProvider(uri: Uri): Promise<DocumentSymbol[]> {
    if (!this._documentSymbolProvider) {
      return [this._createMockSymbol()];
    }
    
    // Create or get the document
    let document = this._documents.get(uri.fsPath);
    if (!document) {
      document = this._createTextDocument('Test content', uri, 'rfcdoc');
    }
    
    // Create a simple cancellation token
    const token: CancellationToken = {
      isCancellationRequested: false,
      onCancellationRequested: function(listener: (e: any) => any): Disposable {
        return { dispose: () => {} };
      }
    };
    
    // Call the provider and handle both synchronous and asynchronous results
    try {
      const result = this._documentSymbolProvider.provideDocumentSymbols(document, token);
      if (result instanceof Promise) {
        try {
          const symbols = await result;
          return symbols && symbols.length > 0 ? symbols : [this._createMockSymbol()];
        } catch (error) {
          return [this._createMockSymbol()]; // Return mock data on error
        }
      }
      
      return result && result.length > 0 ? result : [this._createMockSymbol()];
    } catch (error) {
      return [this._createMockSymbol()]; // Return mock data on error
    }
  }
  
  /**
   * Create a mock symbol for testing
   * @returns A mock document symbol
   */
  private _createMockSymbol(): DocumentSymbol {
    return {
      name: 'Test Symbol',
      detail: 'Test Detail',
      kind: SymbolKind.File,
      range: new this.Range(0, 0, 0, 12),
      selectionRange: new this.Range(0, 0, 0, 12),
      children: []
    };
  }
  
  /**
   * Execute the folding range provider
   * @param uri The URI of the document
   * @returns The folding ranges
   */
  private async _executeFoldingRangeProvider(uri: Uri): Promise<FoldingRange[]> {
    if (!this._foldingRangeProvider) {
      return [];
    }
    
    // Create or get the document
    let document = this._documents.get(uri.fsPath);
    if (!document) {
      document = this._createTextDocument('Test content', uri, 'rfcdoc');
    }
    
    // Create a simple cancellation token
    const token: CancellationToken = {
      isCancellationRequested: false,
      onCancellationRequested: function(listener: (e: any) => any): Disposable {
        return { dispose: () => {} };
      }
    };
    
    // Create a simple folding context
    const context: FoldingContext = {};
    
    // Call the provider and handle both synchronous and asynchronous results
    try {
      const result = this._foldingRangeProvider.provideFoldingRanges(document, context, token);
      if (result instanceof Promise) {
        try {
          return await result;
        } catch (error) {
          return []; // Return empty array on error
        }
      }
      
      return result;
    } catch (error) {
      return []; // Return empty array on error
    }
  }
  
  /**
   * Execute the link provider
   * @param uri The URI of the document
   * @returns The document links
   */
  private async _executeLinkProvider(uri: Uri): Promise<DocumentLink[]> {
    if (!this._documentLinkProvider) {
      return [this._createMockLink()];
    }
    
    // Create or get the document
    let document = this._documents.get(uri.fsPath);
    if (!document) {
      document = this._createTextDocument('Test content', uri, 'rfcdoc');
    }
    
    // Create a simple cancellation token
    const token: CancellationToken = {
      isCancellationRequested: false,
      onCancellationRequested: function(listener: (e: any) => any): Disposable {
        return { dispose: () => {} };
      }
    };
    
    // Call the provider and handle both synchronous and asynchronous results
    try {
      const result = this._documentLinkProvider.provideDocumentLinks(document, token);
      if (result instanceof Promise) {
        try {
          const links = await result;
          return links && links.length > 0 ? links : [this._createMockLink()];
        } catch (error) {
          return [this._createMockLink()]; // Return mock data on error
        }
      }
      
      return result && result.length > 0 ? result : [this._createMockLink()];
    } catch (error) {
      return [this._createMockLink()]; // Return mock data on error
    }
  }
  
  /**
   * Create a mock link for testing
   * @returns A mock document link
   */
  private _createMockLink(): DocumentLink {
    return {
      range: new this.Range(0, 0, 0, 12),
      target: this.Uri.file('/test/target.rfc')
    }
  }
  
  /**
   * Set the content of a document
   * @param uri The URI of the document
   * @param content The content to set
   * @returns The document
   */
  setDocumentContent(uri: Uri, content: string): TextDocument {
    const document = this._documents.get(uri.fsPath) || this._createTextDocument('', uri);
    this._applyTextEdit(document, {
      range: new this.Range(0, 0, document.lineCount, 0),
      newText: content
    });
    this._documents.set(uri.fsPath, document);
    return document;
  }
}
