/**
 * VSCode Live Backend
 * This is a thin wrapper around the actual VSCode API
 */

import * as vscode from 'vscode';

import { 
  Backend, Position, Range, Selection, Uri, TextDocument, TextEditor, 
  Disposable, WorkspaceEdit, TextEditorDecorationType, DiagnosticCollection,
  DocumentSymbolProvider, DocumentLinkProvider, FoldingRangeProvider, 
  CompletionItemProvider, OutputChannel, WorkspaceFolder, Diagnostic
} from '../../types';

// Export format commands
export { formatCommands } from './format-commands';

// Export footnote commands
export { numberFootnotes } from './footnote-commands';

// Export numbering commands
export { fixNumbering } from './numbering-commands';

// Export reference commands
export { checkReferences } from './reference-commands';

/**
 * VSCode Live Backend class
 * Implements the Backend interface using the actual VSCode API
 * This class adapts the VSCode API to our custom interface
 */
export class VSCodeLiveBackend implements Backend {
  // Position constructor
  Position: typeof vscode.Position;
  
  // Range constructor
  Range: any;
  
  // Selection constructor
  Selection: any;
  
  // Uri static methods
  Uri: any;
  
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
  
  /**
   * Constructor
   * Initialize the backend with the actual VSCode API
   */
  constructor() {
    // Directly expose VSCode APIs with adaptations where needed
    this.Position = vscode.Position;
    
    // Adapt Range constructor to match our interface
    this.Range = function(startLine: number | Position, startCharacter: number | Position, endLine?: number, endCharacter?: number) {
      if (typeof startLine === 'number') {
        return new vscode.Range(startLine, startCharacter as number, endLine as number, endCharacter as number);
      } else {
        return new vscode.Range(
          startLine as unknown as vscode.Position, 
          startCharacter as unknown as vscode.Position
        );
      }
    };
    
    // Adapt Selection constructor to match our interface
    this.Selection = function(anchorLine: number | Position, anchorCharacter: number | Position, activeLine?: number, activeCharacter?: number) {
      if (typeof anchorLine === 'number') {
        return new vscode.Selection(anchorLine, anchorCharacter as number, activeLine as number, activeCharacter as number);
      } else {
        return new vscode.Selection(
          anchorLine as unknown as vscode.Position, 
          anchorCharacter as unknown as vscode.Position
        );
      }
    };
    
    // Adapt Uri methods to match our interface
    this.Uri = {
      file: (path: string) => vscode.Uri.file(path),
      parse: (value: string) => vscode.Uri.parse(value)
    };
    
    // Workspace APIs
    this.workspace = {
      openTextDocument: async function(uriOrPath: Uri | string): Promise<TextDocument> {
        if (typeof uriOrPath === 'string') {
          return await vscode.workspace.openTextDocument(uriOrPath) as unknown as TextDocument;
        } else {
          return await vscode.workspace.openTextDocument(uriOrPath as unknown as vscode.Uri) as unknown as TextDocument;
        }
      },
      
      applyEdit: async function(edit: WorkspaceEdit): Promise<boolean> {
        // Convert our WorkspaceEdit to vscode.WorkspaceEdit
        const vscodeEdit = new vscode.WorkspaceEdit();
        
        // Process all entries in the edit
        for (const [uri, edits] of edit.entries()) {
          for (const textEdit of edits) {
            vscodeEdit.replace(
              uri as unknown as vscode.Uri,
              textEdit.range as unknown as vscode.Range,
              textEdit.newText
            );
          }
        }
        
        return await vscode.workspace.applyEdit(vscodeEdit);
      },
      
      getWorkspaceFolder: function(uri: Uri): WorkspaceFolder | undefined {
        const folder = vscode.workspace.getWorkspaceFolder(uri as unknown as vscode.Uri);
        if (folder) {
          return {
            uri: folder.uri as unknown as Uri,
            name: folder.name,
            index: folder.index
          };
        }
        return undefined;
      },
    };
    
    // Window APIs
    this.window = {
      get activeTextEditor(): TextEditor | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return undefined;
        
        return editor as unknown as TextEditor;
      },
      
      showTextDocument: async function(document: TextDocument): Promise<TextEditor> {
        return await vscode.window.showTextDocument(document as unknown as vscode.TextDocument) as unknown as TextEditor;
      },
      
      createOutputChannel: function(name: string): OutputChannel {
        const channel = vscode.window.createOutputChannel(name);
        return {
          name: channel.name,
          append: (value: string) => channel.append(value),
          appendLine: (value: string) => channel.appendLine(value),
          clear: () => channel.clear(),
          show: () => channel.show(),
          hide: () => channel.hide(),
          dispose: () => channel.dispose()
        };
      },
      
      showInformationMessage: async function(message: string): Promise<string | undefined> {
        return await vscode.window.showInformationMessage(message);
      },
      
      showWarningMessage: async function(message: string): Promise<string | undefined> {
        return await vscode.window.showWarningMessage(message);
      },
      
      showErrorMessage: async function(message: string): Promise<string | undefined> {
        return await vscode.window.showErrorMessage(message);
      },
      
      createTextEditorDecorationType: function(options: any): TextEditorDecorationType {
        const decorationType = vscode.window.createTextEditorDecorationType(options);
        return {
          id: decorationType.key || Math.random().toString(36).substring(2, 9),
          options: options
        };
      },
    };
    
    // Language APIs
    this.languages = {
      registerDocumentSymbolProvider: function(selector: any, provider: DocumentSymbolProvider): Disposable {
        return vscode.languages.registerDocumentSymbolProvider(
          selector, 
          provider as unknown as vscode.DocumentSymbolProvider
        ) as unknown as Disposable;
      },
      
      registerDocumentLinkProvider: function(selector: any, provider: DocumentLinkProvider): Disposable {
        return vscode.languages.registerDocumentLinkProvider(
          selector, 
          provider as unknown as vscode.DocumentLinkProvider
        ) as unknown as Disposable;
      },
      
      registerFoldingRangeProvider: function(selector: any, provider: FoldingRangeProvider): Disposable {
        return vscode.languages.registerFoldingRangeProvider(
          selector, 
          provider as unknown as vscode.FoldingRangeProvider
        ) as unknown as Disposable;
      },
      
      registerCompletionItemProvider: function(selector: any, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable {
        return vscode.languages.registerCompletionItemProvider(
          selector, 
          provider as unknown as vscode.CompletionItemProvider, 
          ...triggerCharacters
        ) as unknown as Disposable;
      },
      
      createDiagnosticCollection: function(name: string): DiagnosticCollection {
        const collection = vscode.languages.createDiagnosticCollection(name);
        
        return {
          name: collection.name,
          set: function(uri: Uri, diagnostics: Diagnostic[]): void {
            collection.set(
              uri as unknown as vscode.Uri, 
              diagnostics as unknown as vscode.Diagnostic[]
            );
          },
          delete: function(uri: Uri): void {
            collection.delete(uri as unknown as vscode.Uri);
          },
          clear: function(): void {
            collection.clear();
          },
          dispose: function(): void {
            collection.dispose();
          }
        };
      },
    };
    
    // Command APIs
    this.commands = {
      executeCommand: async function(command: string, ...args: any[]): Promise<any> {
        return await vscode.commands.executeCommand(command, ...args);
      },
      
      registerCommand: function(command: string, callback: (...args: any[]) => any): Disposable {
        return vscode.commands.registerCommand(command, callback) as unknown as Disposable;
      },
      
      getCommands: async function(): Promise<string[]> {
        return await vscode.commands.getCommands();
      },
    };
  }
  
  /**
   * Set the content of a document
   * @param {Uri} uri The URI of the document
   * @param {string} content The content to set
   * @returns {TextDocument} The document
   */
  setDocumentContent(uri: Uri, content: string): TextDocument {
    // This is a test-only method that doesn't have a direct VSCode equivalent
    // In a real VSCode environment, we'd need to write to the file system
    throw new Error('setDocumentContent is not supported in the VSCode Live Backend');
  }
}