# VSCode APIs to Mock for Unit Testing

This document outlines the VSCode APIs that need to be mocked to enable unit testing of the RfcDoc extension. The APIs are grouped by theme to make it easier to understand their purpose and relationships.

## Document and Text Manipulation

### Position and Range

- `vscode.Position` - Represents a position in a text document
  - Properties: `line`, `character`
  - Methods: `isEqual`, `isBefore`, `isAfter`, `translate`, `with`
- `vscode.Range` - Represents a range in a text document
  - Properties: `start`, `end`
  - Methods: `isEmpty`, `isSingleLine`, `contains`, `isEqual`, `intersection`, `union`, `with`
- `vscode.Selection` - Extends Range to represent a text selection
  - Properties: `anchor`, `active`
  - Methods: `isReversed`

### Text Document

- `vscode.TextDocument` - Represents a text document
  - Properties: `uri`, `fileName`, `languageId`, `version`, `lineCount`, `isDirty`, `isClosed`
  - Methods: `getText`, `lineAt`, `offsetAt`, `positionAt`, `save`
- `vscode.TextLine` - Represents a line in a text document
  - Properties: `lineNumber`, `text`, `range`, `rangeIncludingLineBreak`, `firstNonWhitespaceCharacterIndex`, `isEmptyOrWhitespace`

### Text Editor

- `vscode.TextEditor` - Represents a text editor
  - Properties: `document`, `selection`, `selections`, `visibleRanges`
  - Methods: `edit`, `setDecorations`
- `vscode.TextEditorEdit` - Builder for edits in a text editor
  - Methods: `replace`, `insert`, `delete`
- `vscode.TextEditorDecorationType` - Decoration type for text editors
  - Properties: `key`
  - Methods: `dispose`

### Workspace Editing

- `vscode.WorkspaceEdit` - A workspace edit represents textual changes to many documents
  - Methods: `replace`, `insert`, `delete`, `has`, `set`, `get`, `entries`, `size`
- `vscode.TextEdit` - Represents a single edit operation
  - Properties: `range`, `newText`

## Document Analysis and Navigation

### Document Symbols

- `vscode.DocumentSymbol` - Represents a symbol in a document
  - Properties: `name`, `detail`, `kind`, `range`, `selectionRange`, `children`
- `vscode.SymbolKind` - Enumeration of symbol kinds
- `vscode.DocumentSymbolProvider` - Provider for document symbols
  - Methods: `provideDocumentSymbols`

### Document Links

- `vscode.DocumentLink` - Represents a link in a document
  - Properties: `range`, `target`
- `vscode.DocumentLinkProvider` - Provider for document links
  - Methods: `provideDocumentLinks`, `resolveDocumentLink`

### Folding Ranges

- `vscode.FoldingRange` - Represents a folding range in a document
  - Properties: `start`, `end`, `kind`
- `vscode.FoldingRangeKind` - Enumeration of folding range kinds
- `vscode.FoldingRangeProvider` - Provider for folding ranges
  - Methods: `provideFoldingRanges`

### Completion Items

- `vscode.CompletionItem` - Represents a completion item
  - Properties: `label`, `kind`, `detail`, `documentation`, `sortText`, `filterText`, `insertText`, `range`
- `vscode.CompletionItemKind` - Enumeration of completion item kinds
- `vscode.CompletionItemProvider` - Provider for completion items
  - Methods: `provideCompletionItems`, `resolveCompletionItem`

## Diagnostics and Notifications

### Diagnostics

- `vscode.Diagnostic` - Represents a diagnostic, such as a compiler error
  - Properties: `range`, `message`, `severity`, `source`, `code`
- `vscode.DiagnosticSeverity` - Enumeration of diagnostic severities
- `vscode.DiagnosticCollection` - Collection of diagnostics
  - Methods: `set`, `delete`, `clear`, `dispose`

### Notifications

- `vscode.OutputChannel` - Channel for output messages
  - Methods: `append`, `appendLine`, `clear`, `show`, `hide`, `dispose`

## Resource Management

### URI

- `vscode.Uri` - Uniform Resource Identifier
  - Properties: `scheme`, `authority`, `path`, `query`, `fragment`, `fsPath`
  - Methods: `with`, `toString`
  - Static Methods: `file`, `parse`

### Workspace

- `vscode.WorkspaceFolder` - Represents a workspace folder
  - Properties: `uri`, `name`, `index`

## Command and Extension Management

### Commands

- `vscode.commands` - Command management
  - Methods: `executeCommand`, `registerCommand`, `getCommands`

### Extensions

- `vscode.extensions` - Extension management
  - Methods: `getExtension`
  - Properties: `all`

### Disposable

- `vscode.Disposable` - Represents a disposable resource
  - Methods: `dispose`

## Event Handling

### Events

- `vscode.Event` - Event emitter
- `vscode.EventEmitter` - Event emitter implementation
- `vscode.CancellationToken` - Token for cancellation
  - Properties: `isCancellationRequested`
  - Events: `onCancellationRequested`

## Implementation Strategy

To effectively mock these APIs for unit testing, we should:

1. Create a layered architecture:
   - Core business logic that doesn't depend on VSCode APIs
   - Adapter layer that connects the core logic to VSCode APIs
   - Extension layer that registers commands and providers

2. Implement a backend system:
   - `VSCodeLiveBackend` - Thin wrapper around actual VSCode APIs for integration tests
   - `HeadlessBackend` - Mock implementation for unit tests

3. Use dependency injection:
   - Inject the backend into the core logic
   - Switch backends based on the test environment

4. Create test utilities:
   - Helper functions to set up test documents and editors
   - Utilities to verify the state of the mock system

This approach will allow us to:

- Run unit tests without VSCode dependencies
- Test business logic in isolation
- Verify interactions with VSCode APIs
- Ensure consistent behavior across environments
