/**
 * VSCode Live Backend - Format Commands
 * This file contains implementations for format-related commands that use the headless backend
 */

import * as vscode from 'vscode';
import {
  formatDocumentCommand,
  numberFootnotes,
  generateTOCCommand,
  fullFormattingCommand
} from '../headless';
import { isCommandResult, getErrorMessage } from '../../error-utils';

// Export individual functions for direct access
export async function formatDocument(document: vscode.TextDocument): Promise<boolean> {
  return formatCommands.formatDocument(document);
}

export async function generateTOC(document: vscode.TextDocument): Promise<boolean> {
  return formatCommands.generateTOC(document);
}

export async function fullFormatting(document: vscode.TextDocument): Promise<boolean> {
  return formatCommands.fullFormatting(document);
}

/**
 * Command implementations for formatting operations in VSCode
 */
export const formatCommands = {
  /**
   * Format a document according to the RFC specification
   * @param document - The VSCode document to format
   * @returns - Whether the formatting was successful
   */
  formatDocument: async (document: vscode.TextDocument): Promise<boolean> => {
    try {
      // Only format RFC files
      if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showInformationMessage('Format command only works on RFC documents.');
        return false;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return false;
      }

      // Get the document text
      const text = document.getText();

      // Use the headless implementation to format the document
      const result = await formatDocumentCommand(text, document.fileName);

      // Validate result using type guard
      if (!isCommandResult(result)) {
        vscode.window.showErrorMessage('Invalid result from format document command');
        return false;
      }

      if (!result.success) {
        vscode.window.showErrorMessage(getErrorMessage(result.error, 'Error formatting document'));
        return false;
      }

      // Type guard to ensure result.result is a string
      if (typeof result.result !== 'string') {
        vscode.window.showErrorMessage('Invalid result type from format document command');
        return false;
      }

      const formattedText = result.result;

      // If the text didn't change, there's nothing to do
      if (formattedText === text) {
        return true;
      }

      // Apply the changes to the document
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));

      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, formattedText);
      });

      vscode.window.showInformationMessage('Document formatted successfully.');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Error formatting document: ${error}`);
      return false;
    }
  },

  /**
   * Generate a table of contents for a document
   * @param document - The VSCode document to generate TOC for
   * @returns - Whether the TOC generation was successful
   */
  generateTOC: async (document: vscode.TextDocument): Promise<boolean> => {
    try {
      // Only generate TOC for RFC files
      if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showInformationMessage('TOC command only works on RFC documents.');
        return false;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return false;
      }

      // Get the document text
      const text = document.getText();

      // Use the headless implementation to generate the TOC
      const result = await generateTOCCommand(text, document.fileName);

      // Validate result using type guard
      if (!isCommandResult(result)) {
        vscode.window.showErrorMessage('Invalid result from generate TOC command');
        return false;
      }

      if (!result.success) {
        // If the error is just that no sections were found, show an information message
        if (result.error?.message === 'No sections found to generate TOC') {
          vscode.window.showInformationMessage('No sections found to generate TOC.');
        } else {
          vscode.window.showErrorMessage(getErrorMessage(result.error, 'Error generating TOC'));
        }
        return false;
      }

      // Type guard to ensure result.result is a string
      if (typeof result.result !== 'string') {
        vscode.window.showErrorMessage('Invalid result type from generate TOC command');
        return false;
      }

      const newText = result.result;

      // If the text didn't change, there were no sections
      if (newText === text) {
        vscode.window.showInformationMessage('No sections found to generate TOC.');
        return false;
      }

      // Apply the changes to the document
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));

      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newText);
      });

      vscode.window.showInformationMessage('Table of contents generated successfully.');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Error generating TOC: ${error}`);
      return false;
    }
  },

  /**
   * Number footnotes sequentially and update references
   * @param document - The VSCode document to number footnotes in
   * @returns - Whether the footnote numbering was successful
   */
  numberFootnotes: async (document: vscode.TextDocument): Promise<boolean> => {
    try {
      // Only number footnotes in RFC files
      if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showInformationMessage('Footnote numbering only works on RFC documents.');
        return false;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return false;
      }

      // Get the document text
      const text = document.getText();

      // Use the headless implementation to number footnotes
      const result = await numberFootnotes(text, document.fileName);

      // Validate result using type guard
      if (!isCommandResult(result)) {
        vscode.window.showErrorMessage('Invalid result from number footnotes command');
        return false;
      }

      if (!result.success) {
        vscode.window.showErrorMessage(getErrorMessage(result.error, 'Error numbering footnotes'));
        return false;
      }

      // Type guard to ensure result.result is a string
      if (typeof result.result !== 'string') {
        vscode.window.showErrorMessage('Invalid result type from number footnotes command');
        return false;
      }

      const newText = result.result;

      // If the text didn't change, there were no footnotes
      if (newText === text) {
        return true;
      }

      // Apply the changes to the document
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));

      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newText);
      });

      vscode.window.showInformationMessage('Footnotes numbered successfully.');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Error numbering footnotes: ${error}`);
      return false;
    }
  },

  /**
   * Apply full formatting to the document
   * @param document - The VSCode document to format
   * @returns - Whether the formatting was successful
   */
  fullFormatting: async (document: vscode.TextDocument): Promise<boolean> => {
    try {
      // Only format RFC files
      if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showInformationMessage('Full formatting only works on RFC documents.');
        return false;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return false;
      }

      // Get the document text
      const text = document.getText();

      // Use the headless implementation to apply full formatting
      const result = await fullFormattingCommand(text, document.fileName);

      // Validate result using type guard
      if (!isCommandResult(result)) {
        vscode.window.showErrorMessage('Invalid result from full formatting command');
        return false;
      }

      if (!result.success) {
        vscode.window.showErrorMessage(
          getErrorMessage(result.error, 'Error applying full formatting')
        );
        return false;
      }

      // Type guard to ensure result.result is a string
      if (typeof result.result !== 'string') {
        vscode.window.showErrorMessage('Invalid result type from full formatting command');
        return false;
      }

      const formattedText = result.result;

      // If the text didn't change, there's nothing to do
      if (formattedText === text) {
        return true;
      }

      // Apply the changes to the document
      const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));

      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, formattedText);
      });

      vscode.window.showInformationMessage('Document fully formatted successfully.');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Error applying full formatting: ${error}`);
      return false;
    }
  },
};
