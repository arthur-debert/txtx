/**
 * Footnote Commands - VSCode Live Backend
 *
 * This module provides VSCode-specific implementations of footnote commands.
 */

import * as vscode from 'vscode';
import { numberFootnotes as headlessNumberFootnotes } from '../headless/footnote-commands';
import { isCommandResult, getErrorMessage } from '../../error-utils';

/**
 * Number footnotes sequentially and update references
 * @param document - The VSCode document to process
 * @returns - Whether the operation was successful
 */
export async function numberFootnotes(document: vscode.TextDocument): Promise<boolean> {
  // Only process RFC files
  if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
    vscode.window.showWarningMessage('Number Footnotes command is only available for .rfc files');
    return false;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return false;
  }

  try {
    // Get the document text
    const text = document.getText();

    // Process footnotes using the headless backend
    const result = await headlessNumberFootnotes(text, document.fileName);

    // Validate result using type guard
    if (!isCommandResult(result)) {
      vscode.window.showErrorMessage('Invalid result from footnote numbering');
      return false;
    }

    if (!result.success) {
      vscode.window.showErrorMessage(`Error numbering footnotes: ${getErrorMessage(result.error)}`);
      return false;
    }

    // Replace the entire document text
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(
        document.lineCount - 1,
        document.lineAt(document.lineCount - 1).text.length
      )
    );

    await editor.edit(editBuilder => {
      // Type guard to ensure result.result is a string
      if (typeof result.result !== 'string') {
        throw new Error('Invalid result type from footnote numbering');
      }

      editBuilder.replace(fullRange, result.result);
    });

    vscode.window.showInformationMessage('Footnotes numbered successfully');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Error numbering footnotes: ${errorMessage}`);
    return false;
  }
}
