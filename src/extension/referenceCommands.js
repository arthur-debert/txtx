const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const { DOCUMENT_REFERENCE_REGEX, SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } = require("./constants");

/**
 * Check that all document references point to valid targets
 * @param {vscode.TextDocument} document - The document to process
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function checkReferences(document) {
    // Only process RFC files
    if (document.languageId !== 'txtdoc' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showWarningMessage('Check References command is only available for .rfc files');
        return false;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        
        // Find all document references
        const references = [];
        let match;
        
        // Reset the regex lastIndex
        DOCUMENT_REFERENCE_REGEX.lastIndex = 0;
        while ((match = DOCUMENT_REFERENCE_REGEX.exec(text)) !== null) {
            const filePath = match[1];
            const anchor = match[2] || '';
            const position = document.positionAt(match.index);
            
            references.push({
                filePath,
                anchor,
                position,
                range: new vscode.Range(
                    position,
                    document.positionAt(match.index + match[0].length)
                )
            });
        }
        
        if (references.length === 0) {
            vscode.window.showInformationMessage('No document references found');
            return true;
        }
        
        // Validate each reference
        const diagnostics = [];
        const documentDir = path.dirname(document.uri.fsPath);
        
        for (const ref of references) {
            // Resolve the file path relative to the current document
            const targetPath = path.resolve(documentDir, ref.filePath);
            
            // Check if the file exists
            if (!fs.existsSync(targetPath)) {
                // File doesn't exist
                diagnostics.push({
                    message: `Referenced file not found: ${ref.filePath}`,
                    range: ref.range,
                    severity: vscode.DiagnosticSeverity.Error
                });
                continue;
            }
            
            // If there's an anchor, check if it exists in the target file
            if (ref.anchor) {
                try {
                    const targetContent = fs.readFileSync(targetPath, 'utf8');
                    const anchorExists = await checkAnchorExists(targetContent, ref.anchor);
                    
                    if (!anchorExists) {
                        // Anchor doesn't exist in the target file
                        diagnostics.push({
                            message: `Anchor not found in target file: #${ref.anchor}`,
                            range: ref.range,
                            severity: vscode.DiagnosticSeverity.Error
                        });
                    }
                } catch (error) {
                    // Error reading the target file
                    diagnostics.push({
                        message: `Error reading target file: ${error.message}`,
                        range: ref.range,
                        severity: vscode.DiagnosticSeverity.Error
                    });
                }
            }
        }
        
        // Report the results
        if (diagnostics.length === 0) {
            vscode.window.showInformationMessage('All references are valid');
        } else {
            // Create a diagnostic collection for the document
            const diagnosticCollection = vscode.languages.createDiagnosticCollection('txtdoc-references');
            diagnosticCollection.set(document.uri, diagnostics.map(d => new vscode.Diagnostic(d.range, d.message, d.severity)));
            
            vscode.window.showWarningMessage(`Found ${diagnostics.length} invalid references`);
        }
        
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error checking references: ${error.message}`);
        return false;
    }
}

/**
 * Check if an anchor exists in the target content
 * @param {string} content - The content to check
 * @param {string} anchor - The anchor to look for
 * @returns {Promise<boolean>} - Whether the anchor exists
 */
async function checkAnchorExists(content, anchor) {
    // Convert the anchor to a section title format
    // Anchors are typically in the format "section-name" or "section-1-2"
    const anchorParts = anchor.split('-');
    
    // Check if it's a numbered section (e.g., "section-1-2")
    const isNumberedSection = anchorParts.some(part => /^\d+$/.test(part));
    
    if (isNumberedSection) {
        // Try to match a numbered section
        const sectionNumbers = anchorParts.filter(part => /^\d+$/.test(part));
        const sectionPattern = `^${sectionNumbers.join('\\.')}\\. `;
        const regex = new RegExp(sectionPattern, 'm');
        return regex.test(content);
    } else {
        // Try to match a regular section or alternative section
        // Convert anchor format (e.g., "section-name") to possible section formats
        
        // Convert to uppercase section (e.g., "SECTION NAME")
        const uppercaseSection = anchorParts.join(' ').toUpperCase();
        if (new RegExp(`^${uppercaseSection}$`, 'm').test(content)) {
            return true;
        }
        
        // Convert to alternative section (e.g., ": Section Name")
        const titleCaseSection = anchorParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
        
        if (new RegExp(`^: ${titleCaseSection}$`, 'm').test(content)) {
            return true;
        }
        
        // Try other variations of the section title
        const variations = [
            anchorParts.join(' '), // section name
            anchorParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') // Section Name
        ];
        
        for (const variation of variations) {
            // Check for any section type that contains this text
            if (new RegExp(`^[A-Z][^\\n]*${variation}[^\\n]*$`, 'im').test(content) ||
                new RegExp(`^\\d+(\\.\\d+)*\\. [^\\n]*${variation}[^\\n]*$`, 'im').test(content) ||
                new RegExp(`^: [^\\n]*${variation}[^\\n]*$`, 'im').test(content)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Register the check references command
 * @param {vscode.ExtensionContext} context - The extension context
 * @param {vscode.OutputChannel} outputChannel - The output channel
 */
function registerReferenceCommands(context, outputChannel) {
    // Register the check references command
    const checkReferencesCommand = vscode.commands.registerCommand('txtdoc.checkReferences', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'txtdoc') {
            outputChannel.appendLine('Executing Check References command');
            await checkReferences(editor.document);
        } else {
            vscode.window.showWarningMessage('Check References command is only available for TxtDoc files');
        }
    });
    
    context.subscriptions.push(checkReferencesCommand);
    outputChannel.appendLine('Check References command registered');
}

module.exports = {
    registerReferenceCommands,
    checkReferences
};