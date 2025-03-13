import * as vscode from "vscode";
import * as path from "path";
import { sendNotification } from "./notifications";
import * as vscodeLib from "./vscode.lib";
import { checkReferences, DiagnosticInfo } from "../features/references";

/**
 * Check that all document references point to valid targets
 * @param document - The document to process
 * @returns - Whether the operation was successful
 */
async function checkReferences_VSCode(document: vscode.TextDocument): Promise<boolean> {
  // Only process RFC files
  if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
    sendNotification('REFERENCE_RFC_ONLY');
    return false;
  }

  const editor = vscodeLib.getActiveEditor();
  if (!editor) {
    sendNotification('REFERENCE_NO_EDITOR');
    return false;
  }

  try {
    // Get the entire document text
    const text = document.getText();
    
    // Get the directory of the document
    const documentDir = path.dirname(document.uri.fsPath);
    
    // Check references using the feature
    const result = await checkReferences(text, documentDir);
    
    if (result.referencesFound === 0) {
      sendNotification('REFERENCE_NONE_FOUND');
      return true;
    }
    
    // Report the results
    if (result.diagnostics.length === 0) {
      sendNotification('REFERENCE_ALL_VALID');
    } else {
      // Create a diagnostic collection for the document
      const diagnosticCollection = vscodeLib.createDiagnosticCollection('rfcdoc-references');
      
      // Convert feature diagnostics to VSCode diagnostics
      const vscodeDiagnostics = result.diagnostics.map(d => 
        convertToVSCodeDiagnostic(d, document)
      );
      
      vscodeLib.setDiagnostics(diagnosticCollection, document.uri, vscodeDiagnostics);
      
      sendNotification('REFERENCE_INVALID_FOUND', result.diagnostics.length);
    }
    
    return true;
  } catch (error) {
    sendNotification('REFERENCE_ERROR', error);
    return false;
  }
}

/**
 * Convert a feature diagnostic to a VSCode diagnostic
 * @param diagnostic - The feature diagnostic
 * @param document - The document
 * @returns - The VSCode diagnostic
 */
function convertToVSCodeDiagnostic(
  diagnostic: DiagnosticInfo, 
  document: vscode.TextDocument
): vscode.Diagnostic {
  // Convert the range
  const range = new vscode.Range(
    new vscode.Position(diagnostic.range.start.line, diagnostic.range.start.character),
    new vscode.Position(diagnostic.range.end.line, diagnostic.range.end.character)
  );
  
  // Convert the severity
  let severity: vscode.DiagnosticSeverity;
  switch (diagnostic.severity) {
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
  
  return vscodeLib.createDiagnostic(range, diagnostic.message, severity);
}

/**
 * Register the check references command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerReferenceCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
  // Register the check references command
  const checkReferencesCommand = vscodeLib.registerCommand(
    context, 
    'rfcdoc.checkReferences', 
    checkReferences_VSCode, 
    outputChannel
  );
}

export {
  registerReferenceCommands,
  checkReferences_VSCode as checkReferences
};