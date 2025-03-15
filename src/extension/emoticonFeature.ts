import * as vscode from 'vscode';
import { EMOTICONS, EMOTICON_SEARCH_REGEX } from './constants';

// Define interface for emoticon items
interface EmoticonItem {
  name: string;
  emoticon: string;
}

// Define interface for quick pick items
interface EmoticonQuickPickItem extends vscode.QuickPickItem {
  emoticon: string;
}

// Create a map for quick lookup by partial name
const EMOTICON_MAP = new Map<string, EmoticonItem>();
EMOTICONS.forEach(item => {
  // Add the full name
  EMOTICON_MAP.set(item.name.toLowerCase(), item);

  // Add each word in the name as a separate entry
  const words = item.name.toLowerCase().split(/[,\s]+/);
  words.forEach(word => {
    if (word.length > 2) {
      // Only add words with more than 2 characters
      if (!EMOTICON_MAP.has(word)) {
        EMOTICON_MAP.set(word, item);
      }
    }
  });
});

// Define interface for active emoticon search
interface ActiveEmoticonSearch {
  range: vscode.Range;
  searchTerm: string;
}

// Keep track of active emoticon search
let activeEmoticonSearch: ActiveEmoticonSearch | null = null;
let emoticonSearchDecorationType: vscode.TextEditorDecorationType | null = null;
let emoticonQuickPick: vscode.QuickPick<EmoticonQuickPickItem> | null = null;

/**
 * Register the emoticon feature
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerEmoticonFeature(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Create decoration type for emoticon search
  emoticonSearchDecorationType = vscode.window.createTextEditorDecorationType({
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

      // Check if any of the changes might contain emoticon search pattern
      const containsEmoticonSearch = event.contentChanges.some(change => {
        return EMOTICON_SEARCH_REGEX.test(change.text);
      });

      if (containsEmoticonSearch) {
        await handleEmoticonSearch(editor, outputChannel);
      }
    })
  );

  // Register selection change listener to cancel emoticon search when cursor moves
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(event => {
      if (activeEmoticonSearch && event.textEditor === vscode.window.activeTextEditor) {
        // Cancel emoticon search if cursor moved away from search position
        const position = event.textEditor.selection.active;
        if (!activeEmoticonSearch.range.contains(position)) {
          cancelEmoticonSearch();
        }
      }
    })
  );

  outputChannel.appendLine('Emoticon feature registered');
}

/**
 * Handle emoticon search in the editor
 * @param editor - The text editor
 * @param outputChannel - The output channel
 */
async function handleEmoticonSearch(
  editor: vscode.TextEditor,
  outputChannel: vscode.OutputChannel
): Promise<void> {
  const text = editor.document.getText();
  const matches: ActiveEmoticonSearch[] = [];

  // Find all emoticon search patterns
  EMOTICON_SEARCH_REGEX.lastIndex = 0;
  let match;
  while ((match = EMOTICON_SEARCH_REGEX.exec(text)) !== null) {
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
  if (matches.length > 0 && emoticonSearchDecorationType) {
    const match = matches[matches.length - 1]; // Use the last match (closest to cursor)

    // Highlight the search term
    editor.setDecorations(emoticonSearchDecorationType, [match.range]);

    // Store active search
    activeEmoticonSearch = match;

    // Find matching emoticons
    const results = Array.from(EMOTICON_MAP.entries())
      .filter(([key]) => key.includes(match.searchTerm))
      .map(([key, value]) => ({
        label: `${value.emoticon} ${key}`,
        description: value.name,
        emoticon: value.emoticon,
      }));

    if (results.length > 0) {
      // Show quick pick with matching emoticons
      emoticonQuickPick = vscode.window.createQuickPick<EmoticonQuickPickItem>();
      emoticonQuickPick.items = results;
      emoticonQuickPick.placeholder = 'Select an emoticon';

      emoticonQuickPick.onDidAccept(async () => {
        const selected = emoticonQuickPick?.selectedItems[0];
        if (selected) {
          await replaceEmoticonSearch(editor, match.range, selected.emoticon, outputChannel);
        }
        cancelEmoticonSearch();
      });

      emoticonQuickPick.onDidHide(() => cancelEmoticonSearch());
      emoticonQuickPick.show();
    }
  }
}

/**
 * Replace emoticon search with selected emoticon
 * @param editor - The text editor
 * @param range - The range to replace
 * @param emoticon - The emoticon to insert
 * @param outputChannel - The output channel
 * @returns - Whether the replacement was successful
 */
async function replaceEmoticonSearch(
  editor: vscode.TextEditor,
  range: vscode.Range,
  emoticon: string,
  outputChannel: vscode.OutputChannel
): Promise<boolean> {
  // Use WorkspaceEdit for more reliable editing
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.replace(editor.document.uri, range, emoticon);

  // Apply the edit and log the result
  const success = await vscode.workspace.applyEdit(workspaceEdit);
  outputChannel.appendLine(`Emoticon replacement ${success ? 'succeeded' : 'failed'}: ${emoticon}`);

  // Force a document save to ensure changes are applied
  return editor.document.save().then(() => {
    return success;
  });
}

/**
 * Cancel active emoticon search
 */
function cancelEmoticonSearch(): void {
  if (activeEmoticonSearch && emoticonSearchDecorationType) {
    activeEmoticonSearch = null;

    // Clear decorations
    if (vscode.window.activeTextEditor) {
      vscode.window.activeTextEditor.setDecorations(emoticonSearchDecorationType, []);
    }

    // Hide quick pick
    if (emoticonQuickPick) {
      emoticonQuickPick.hide();
      emoticonQuickPick.dispose();
      emoticonQuickPick = null;
    }
  }
}

export {
  registerEmoticonFeature,
  handleEmoticonSearch,
  replaceEmoticonSearch,
  cancelEmoticonSearch,
  EMOTICON_MAP,
};
