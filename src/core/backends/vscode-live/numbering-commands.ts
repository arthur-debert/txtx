/**
 * Numbering Commands - VSCode Live Backend
 *
 * This module provides VSCode-specific implementations of numbering commands.
 */

import * as vscode from 'vscode';
import { fixDocumentNumbering as headlessFixNumbering } from '../headless/numbering-commands.js';

/**
 * Fix numbering in ordered lists and section headers
 * @param document - The VSCode document to process
 * @returns - Whether the operation was successful
 */
export async function fixNumbering(document: vscode.TextDocument): Promise<boolean> {
  // Only process RFC files
  if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
    vscode.window.showWarningMessage('Fix Numbering command is only available for .rfc files');
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

    // Process numbering using the headless backend
    const result = await headlessFixNumbering(text, document.fileName);

    if (!result.success || !result.fixedText) {
      const errorMessage = result.error || 'Unknown error fixing numbering';
      vscode.window.showErrorMessage(`Error fixing numbering: ${errorMessage}`);
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

    // We've already checked that fixedText is not undefined above
    const fixedText = result.fixedText;

    await editor.edit(editBuilder => {
      editBuilder.replace(fullRange, fixedText);
    });

    vscode.window.showInformationMessage(
      `Numbering fixed successfully (${result.linesChanged} lines changed)`
    );
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Error fixing numbering: ${errorMessage}`);
    return false;
  }
}
