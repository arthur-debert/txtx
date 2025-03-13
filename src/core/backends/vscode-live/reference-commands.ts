/**
 * Reference Commands - VSCode Live Backend
 * 
 * This module provides VSCode-specific implementations of reference commands.
 */

import * as vscode from 'vscode';
import { checkDocumentReferences as headlessCheckReferences } from '../headless/reference-commands';

/**
 * Check references in a document
 * @param document - The VSCode document to process
 * @returns - Whether the operation was successful
 */
export async function checkReferences(document: vscode.TextDocument): Promise<boolean> {
  // Only process RFC files
  if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
    vscode.window.showWarningMessage('Check References command is only available for .rfc files');
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
    
    // Process references using the headless backend
    const result = await headlessCheckReferences(text, document.fileName);
    
    if (!result.success) {
      vscode.window.showErrorMessage(`Error checking references: ${result.diagnostics[0]?.message || 'Unknown error'}`);
      return false;
    }
    
    if (result.referencesFound === 0) {
      vscode.window.showInformationMessage('No references found in the document');
      return true;
    }
    
    // Report the results
    if (result.diagnostics.length === 0) {
      vscode.window.showInformationMessage('All references are valid');
    } else {
      // Create a diagnostic collection for the document
      const diagnosticCollection = vscode.languages.createDiagnosticCollection('rfcdoc-references');
      
      // Convert feature diagnostics to VSCode diagnostics
      const vscodeDiagnostics = result.diagnostics.map(d => {
        // Convert the range
        const range = new vscode.Range(
          new vscode.Position(d.range.start.line, d.range.start.character),
          new vscode.Position(d.range.end.line, d.range.end.character)
        );
        
        // Convert the severity
        let severity: vscode.DiagnosticSeverity;
        switch (d.severity) {
          case 'error':
            severity = vscode.DiagnosticSeverity.Error;
            break;
          case 'warning':
            severity = vscode.DiagnosticSeverity.Warning;
            break;
          case 'information':
            severity = vscode.DiagnosticSeverity.Information;
            break;
          case 'hint':
            severity = vscode.DiagnosticSeverity.Hint;
            break;
          default:
            severity = vscode.DiagnosticSeverity.Error;
        }
        
        return new vscode.Diagnostic(range, d.message, severity);
      });
      
      diagnosticCollection.set(document.uri, vscodeDiagnostics);
      
      vscode.window.showWarningMessage(`Found ${result.diagnostics.length} invalid references`);
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Error checking references: ${errorMessage}`);
    return false;
  }
}