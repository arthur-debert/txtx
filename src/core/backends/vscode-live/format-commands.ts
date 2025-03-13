/**
 * VSCode Live Backend - Format Commands
 * This file contains implementations for format-related commands that use the headless backend
 */

import * as vscode from 'vscode';
import {
  formatDocumentCommand,
  numberFootnotes,
  generateTOCCommand,
  fullFormattingCommand,
  formatDocument,
  fullFormatting
} from '../headless';

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
      if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
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
      
      if (!result.success) {
        vscode.window.showErrorMessage(result.error as string);
        return false;
      }
      
      const formattedText = result.result as string;
      
      // If the text didn't change, there's nothing to do
      if (formattedText === text) {
        return true;
      }
      
      // Apply the changes to the document
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      
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
      if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
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
      
      if (!result.success) {
        // If the error is just that no sections were found, show an information message
        if (result.error === 'No sections found to generate TOC') {
          vscode.window.showInformationMessage('No sections found to generate TOC.');
        } else {
          vscode.window.showErrorMessage(result.error as string);
        }
        return false;
      }
      
      const newText = result.result as string;
      
      // If the text didn't change, there were no sections
      if (newText === text) {
        vscode.window.showInformationMessage('No sections found to generate TOC.');
        return false;
      }
      
      // Apply the changes to the document
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      
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
      if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
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
      
      if (!result.success) {
        vscode.window.showErrorMessage(result.error as string);
        return false;
      }
      
      const newText = result.result as string;
      
      // If the text didn't change, there were no footnotes
      if (newText === text) {
        return true;
      }
      
      // Apply the changes to the document
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      
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
      if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
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
      
      if (!result.success) {
        vscode.window.showErrorMessage(result.error as string);
        return false;
      }
      
      const formattedText = result.result as string;
      
      // If the text didn't change, there's nothing to do
      if (formattedText === text) {
        return true;
      }
      
      // Apply the changes to the document
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      
      await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, formattedText);
      });
      
      vscode.window.showInformationMessage('Document fully formatted successfully.');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Error applying full formatting: ${error}`);
      return false;
    }
  }
};