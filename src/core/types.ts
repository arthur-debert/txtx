/**
 * Type definitions for VSCode API
 * These interfaces define the shape of the VSCode API that we need to implement or mock
 */

export interface Position {
  line: number;
  character: number;
  with(change: { line?: number; character?: number }): Position;
  isEqual(other: Position): boolean;
  isBefore(other: Position): boolean;
  isAfter(other: Position): boolean;
  translate(lineDelta?: number, characterDelta?: number): Position;
}

export interface Range {
  start: Position;
  end: Position;
  contains(positionOrRange: Position | Range): boolean;
  intersection(range: Range): Range | undefined;
  union(range: Range): Range;
  with(change: { start?: Position; end?: Position }): Range;
  isEmpty(): boolean;
  isSingleLine(): boolean;
}

// Selection extends Range but overrides the with method
export interface Selection extends Omit<Range, 'with'> {
  anchor: Position;
  active: Position;
  isReversed(): boolean;
  with(change: { anchor?: Position; active?: Position }): Selection;
}

export interface TextLine {
  text: string;
  lineNumber: number;
  range: Range;
  rangeIncludingLineBreak: Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;
}

export interface Uri {
  scheme: string;
  authority: string;
  path: string;
  query: string;
  fragment: string;
  fsPath: string;
  with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri;
  toString(): string;
}

export interface TextDocument {
  uri: Uri;
  fileName: string;
  languageId: string;
  version: number;
  lineCount: number;
  isDirty: boolean;
  isClosed: boolean;
  getText(): string;
  lineAt(line: number | Position): TextLine;
  positionAt(offset: number): Position;
  offsetAt(position: Position): number;
  save(): Promise<boolean>;
}

export interface TextEditorEdit {
  replace(range: Range, text: string): void;
  insert(position: Position, text: string): void;
  delete(range: Range): void;
}

export interface TextEditor {
  document: TextDocument;
  selection: Selection;
  selections: Selection[];
  visibleRanges: Range[];
  edit(callback: (editBuilder: TextEditorEdit) => void): Promise<boolean>;
  setDecorations(decorationType: TextEditorDecorationType, ranges: Range[]): void;
}

export interface TextEditorDecorationType {
  id: string;
  options: any;
}

export interface WorkspaceEdit {
  replace(uri: Uri, range: Range, newText: string): void;
  delete(uri: Uri, range: Range): void;
  insert(uri: Uri, position: Position, newText: string): void;
  entries(): [Uri, TextEdit[]][];
}

export interface TextEdit {
  range: Range;
  newText: string;
}

export interface Diagnostic {
  range: Range;
  message: string;
  severity: DiagnosticSeverity;
  source?: string;
  code?: string | number;
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}

export interface DiagnosticCollection {
  name: string;
  set(uri: Uri, diagnostics: Diagnostic[]): void;
  delete(uri: Uri): void;
  clear(): void;
  dispose(): void;
}

export interface DocumentSymbol {
  name: string;
  detail: string;
  kind: SymbolKind;
  range: Range;
  selectionRange: Range;
  children: DocumentSymbol[];
}

export enum SymbolKind {
  File = 0,
  Module = 1,
  Namespace = 2,
  Package = 3,
  Class = 4,
  Method = 5,
  Property = 6,
  Field = 7,
  Constructor = 8,
  Enum = 9,
  Interface = 10,
  Function = 11,
  Variable = 12,
  Constant = 13,
  String = 14,
  Number = 15,
  Boolean = 16,
  Array = 17,
  Object = 18,
  Key = 19,
  Null = 20,
  EnumMember = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

export interface DocumentLink {
  range: Range;
  target?: Uri;
}

export interface FoldingRange {
  start: number;
  end: number;
  kind?: FoldingRangeKind;
}

export enum FoldingRangeKind {
  Comment = 1,
  Imports = 2,
  Region = 3
}

export interface CompletionItem {
  label: string;
  kind?: CompletionItemKind;
  detail?: string;
  documentation?: string | MarkdownString;
  sortText?: string;
  filterText?: string;
  insertText?: string;
  range?: Range;
}

export enum CompletionItemKind {
  Text = 0,
  Method = 1,
  Function = 2,
  Constructor = 3,
  Field = 4,
  Variable = 5,
  Class = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Unit = 10,
  Value = 11,
  Enum = 12,
  Keyword = 13,
  Snippet = 14,
  Color = 15,
  File = 16,
  Reference = 17,
  Folder = 18,
  EnumMember = 19,
  Constant = 20,
  Struct = 21,
  Event = 22,
  Operator = 23,
  TypeParameter = 24
}

export interface MarkdownString {
  value: string;
  isTrusted?: boolean;
  supportThemeIcons?: boolean;
}

export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: Event<any>;
}

export interface Event<T> {
  (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}

export interface Disposable {
  dispose(): any;
}

export interface OutputChannel {
  name: string;
  append(value: string): void;
  appendLine(value: string): void;
  clear(): void;
  show(): void;
  hide(): void;
  dispose(): void;
}

export interface WorkspaceFolder {
  uri: Uri;
  name: string;
  index: number;
}

export interface DocumentSymbolProvider {
  provideDocumentSymbols(document: TextDocument, token: CancellationToken): DocumentSymbol[] | Promise<DocumentSymbol[]>;
}

export interface DocumentLinkProvider {
  provideDocumentLinks(document: TextDocument, token: CancellationToken): DocumentLink[] | Promise<DocumentLink[]>;
  resolveDocumentLink?(link: DocumentLink, token: CancellationToken): DocumentLink | Promise<DocumentLink>;
}

export interface FoldingRangeProvider {
  provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): FoldingRange[] | Promise<FoldingRange[]>;
}

export interface FoldingContext {
  maxRanges?: number;
}

export interface CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): CompletionItem[] | Promise<CompletionItem[]>;
  resolveCompletionItem?(item: CompletionItem, token: CancellationToken): CompletionItem | Promise<CompletionItem>;
}

export interface CompletionContext {
  triggerKind: CompletionTriggerKind;
  triggerCharacter?: string;
}

export enum CompletionTriggerKind {
  Invoke = 0,
  TriggerCharacter = 1,
  TriggerForIncompleteCompletions = 2
}

/**
 * VSCode API interface
 * This interface defines the shape of the VSCode API that we expose through our backend system
 */
export interface VSCodeAPI {
  // Position constructor
  Position: new (line: number, character: number) => Position;
  
  // Range constructor with overloads
  Range: {
    new (startLine: number, startCharacter: number, endLine: number, endCharacter: number): Range;
    new (start: Position, end: Position): Range;
  };
  
  // Selection constructor with overloads
  Selection: {
    new (anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): Selection;
    new (anchor: Position, active: Position): Selection;
  };
  
  // Uri static methods
  Uri: {
    file(path: string): Uri;
    parse(value: string): Uri;
  };
  
  // Workspace APIs
  workspace: {
    openTextDocument(uri: Uri): Promise<TextDocument>;
    openTextDocument(fileName: string): Promise<TextDocument>;
    applyEdit(edit: WorkspaceEdit): Promise<boolean>;
    getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined;
  };
  
  // Window APIs
  window: {
    activeTextEditor: TextEditor | undefined;
    showTextDocument(document: TextDocument): Promise<TextEditor>;
    createOutputChannel(name: string): OutputChannel;
    showInformationMessage(message: string): Promise<string | undefined>;
    showWarningMessage(message: string): Promise<string | undefined>;
    showErrorMessage(message: string): Promise<string | undefined>;
    createTextEditorDecorationType(options: any): TextEditorDecorationType;
  };
  
  // Language APIs
  languages: {
    registerDocumentSymbolProvider(selector: any, provider: DocumentSymbolProvider): Disposable;
    registerDocumentLinkProvider(selector: any, provider: DocumentLinkProvider): Disposable;
    registerFoldingRangeProvider(selector: any, provider: FoldingRangeProvider): Disposable;
    registerCompletionItemProvider(selector: any, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
    createDiagnosticCollection(name: string): DiagnosticCollection;
  };
  
  // Command APIs
  commands: {
    executeCommand(command: string, ...args: any[]): Promise<any>;
    registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
    getCommands(): Promise<string[]>;
  };
}

/**
 * Backend interface
 * This extends the VSCodeAPI interface with additional methods for testing
 */
export interface Backend extends VSCodeAPI {
  // Additional methods for testing
  setDocumentContent?(uri: Uri, content: string): TextDocument;
  
  // Numbering commands
  fixNumbering?(document: TextDocument): Promise<boolean>;
}