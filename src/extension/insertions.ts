import * as vscode from 'vscode';
import { loadYamlFile } from './yamlLoader';
import { INSERTION_SEARCH_REGEX } from './constants';

// Define interfaces for insertion items
interface InsertionItem {
  name: string;
  value: string;
}

// Define interface for quick pick items
interface InsertionQuickPickItem extends vscode.QuickPickItem {
  insertValue: string;
}

// Define interface for active insertion search
interface ActiveInsertionSearch {
  range: vscode.Range;
  searchTerm: string;
}

// Will be populated from YAML file
let insertions: string[][] = [];

// Create a map for quick lookup by partial name
const INSERTION_MAP = new Map<string, InsertionItem>();

// Keep track of active insertion search
let activeInsertionSearch: ActiveInsertionSearch | null = null;
let searchDecorationType: vscode.TextEditorDecorationType | null = null;
let quickPick: vscode.QuickPick<InsertionQuickPickItem> | null = null;

/**
 * Register the insertions feature
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerInsertions(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Load insertions from YAML file
  insertions = loadYamlFile('src/extension/insertions.yaml', outputChannel) as string[][];

  outputChannel.appendLine(`Loaded ${insertions.length} insertions`);

  // Populate the insertion map
  insertions.forEach(item => {
    const [name, value] = item;

    // Add the full name
    const itemObj: InsertionItem = { name, value };
    INSERTION_MAP.set(name.toLowerCase(), itemObj);

    // Add each word in the name as a separate entry
    const words = name.toLowerCase().split(/[,\s]+/);
    words.forEach(word => {
      if (word.length > 2) {
        // Only add words with more than 2 characters
        if (!INSERTION_MAP.has(word)) {
          INSERTION_MAP.set(word, itemObj);
        }
      }
    });
  });

  // Create decoration type for insertion search
  searchDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
    borderRadius: '3px',
  });

  // Register text document change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async event => {
      // Only process txxt files
      if (event.document.languageId !== 'txxt') return;

      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document !== event.document) return;

      // Check if any of the changes might contain insertion search pattern
      const containsInsertionSearch = event.contentChanges.some(change => {
        return INSERTION_SEARCH_REGEX.test(change.text);
      });

      if (containsInsertionSearch) {
        await handleInsertionSearch(editor, outputChannel);
      }
    })
  );

  // Register selection change listener to cancel insertion search when cursor moves
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(event => {
      if (activeInsertionSearch && event.textEditor === vscode.window.activeTextEditor) {
        // Cancel insertion search if cursor moved away from search position
        const position = event.textEditor.selection.active;
        if (!activeInsertionSearch.range.contains(position)) {
          cancelSearch();
        }
      }
    })
  );

  outputChannel.appendLine('Insertions feature registered');
}

/**
 * Handle insertion search in the editor
 * @param editor - The text editor
 * @param outputChannel - The output channel
 */
async function handleInsertionSearch(
  editor: vscode.TextEditor,
  outputChannel: vscode.OutputChannel
): Promise<void> {
  const text = editor.document.getText();
  const matches: ActiveInsertionSearch[] = [];

  // Find all insertion search patterns
  INSERTION_SEARCH_REGEX.lastIndex = 0;
  let match;
  while ((match = INSERTION_SEARCH_REGEX.exec(text)) !== null) {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    const range = new vscode.Range(startPos, endPos);

    // Check if cursor is at or right after this match
    const cursorPos = editor.selection.active;
    if (
      range.contains(cursorPos) ||
      (cursorPos.line === endPos.line && cursorPos.character === endPos.character)
    ) {
      const searchTerm = match[1].toLowerCase();
      matches.push({ range, searchTerm });
    }
  }

  // Process the match closest to cursor if any
  if (matches.length > 0 && searchDecorationType) {
    const match = matches[matches.length - 1]; // Use the last match (closest to cursor)

    // Highlight the search term
    editor.setDecorations(searchDecorationType, [match.range]);

    // Store active search
    activeInsertionSearch = match;

    // Find matching insertions
    const results = Array.from(INSERTION_MAP.entries())
      .filter(([key]) => key.includes(match.searchTerm))
      .map(([key, value]) => ({
        label: `${value.value} ${key}`,
        description: value.name,
        insertValue: value.value,
      }));

    if (results.length > 0) {
      // Show quick pick with matching insertions
      quickPick = vscode.window.createQuickPick<InsertionQuickPickItem>();
      quickPick.items = results;
      quickPick.placeholder = 'Select an item to insert';

      quickPick.onDidAccept(async () => {
        const selected = quickPick?.selectedItems[0];
        if (selected) {
          await replaceInsertionSearch(editor, match.range, selected.insertValue, outputChannel);
        }
        cancelSearch();
      });

      quickPick.onDidHide(() => cancelSearch());
      quickPick.show();
    }
  }
}

/**
 * Replace insertion search with selected item
 * @param editor - The text editor
 * @param range - The range to replace
 * @param insertValue - The value to insert
 * @param outputChannel - The output channel
 * @returns - Whether the replacement was successful
 */
async function replaceInsertionSearch(
  editor: vscode.TextEditor,
  range: vscode.Range,
  insertValue: string,
  outputChannel: vscode.OutputChannel
): Promise<boolean> {
  // Use WorkspaceEdit for more reliable editing
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.replace(editor.document.uri, range, insertValue);

  // Apply the edit and log the result
  const success = await vscode.workspace.applyEdit(workspaceEdit);
  outputChannel.appendLine(
    `Insertion replacement ${success ? 'succeeded' : 'failed'}: ${insertValue}`
  );

  // Force a document save to ensure changes are applied
  return editor.document.save().then(() => {
    return success;
  });
}

/**
 * Cancel active search
 */
function cancelSearch(): void {
  if (activeInsertionSearch && searchDecorationType) {
    activeInsertionSearch = null;

    // Clear decorations
    if (vscode.window.activeTextEditor) {
      vscode.window.activeTextEditor.setDecorations(searchDecorationType, []);
    }

    // Hide quick pick
    if (quickPick) {
      quickPick.hide();
      quickPick.dispose();
      quickPick = null;
    }
  }
}

export {
  registerInsertions,
  handleInsertionSearch,
  replaceInsertionSearch,
  cancelSearch,
  INSERTION_MAP,
};
