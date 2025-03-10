const vscode = require("vscode");

/**
 * Format a document according to the RFC specification
 * @param {vscode.TextDocument} document - The document to format
 * @returns {Promise<boolean>} - Whether the formatting was successful
 */
async function formatDocument(document) {
    // Only format RFC files
    if (document.languageId !== 'txtdoc' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showWarningMessage('Format Document command is only available for .rfc files');
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
        const lines = text.split('\n');
        
        // Apply formatting rules
        const formattedLines = formatLines(lines);
        
        // Replace the entire document text
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
        );
        
        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, formattedLines.join('\n'));
        });
        
        vscode.window.showInformationMessage('Document formatted successfully');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error formatting document: ${error.message}`);
        return false;
    }
}

/**
 * Format lines according to the RFC specification
 * @param {string[]} lines - The lines to format
 * @returns {string[]} - The formatted lines
 */
function formatLines(lines) {
    const formattedLines = [];
    let inSection = false;
    let inList = false;
    let inCodeBlock = false;
    let inQuote = false;
    let inMetadata = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Trim trailing whitespace
        line = line.trimRight();
        
        // Check for section headers
        if (isSection(line)) {
            inSection = true;
            inList = false;
            inCodeBlock = false;
            inQuote = false;
            inMetadata = false;
            
            // Ensure there's a blank line before sections (except at the start of the document)
            if (i > 0 && formattedLines[formattedLines.length - 1] !== '') {
                formattedLines.push('');
            }
            
            formattedLines.push(line);
            
            // Ensure there's a blank line after section headers
            if (i < lines.length - 1 && lines[i + 1] !== '') {
                formattedLines.push('');
            }
            continue;
        }
        
        // Check for metadata
        if (isMetadata(line)) {
            inMetadata = true;
            inSection = false;
            inList = false;
            inCodeBlock = false;
            inQuote = false;
            
            // Format metadata with consistent spacing
            const [key, value] = splitMetadata(line);
            if (key && value) {
                formattedLines.push(`${key.padEnd(14)}${value}`);
            } else {
                formattedLines.push(line);
            }
            continue;
        }
        
        // Check for lists
        if (isList(line)) {
            inList = true;
            inCodeBlock = false;
            inQuote = false;
            
            formattedLines.push(line);
            continue;
        }
        
        // Check for code blocks (indented with 4 spaces)
        if (line.startsWith('    ') && !line.startsWith('     ')) {
            inCodeBlock = true;
            inList = false;
            inQuote = false;
            
            formattedLines.push(line);
            continue;
        }
        
        // Check for quotes
        if (line.startsWith('>')) {
            inQuote = true;
            inList = false;
            inCodeBlock = false;
            
            formattedLines.push(line);
            continue;
        }
        
        // Handle blank lines
        if (line.trim() === '') {
            inList = false;
            inCodeBlock = false;
            inQuote = false;
            
            formattedLines.push('');
            continue;
        }
        
        // Handle regular text
        formattedLines.push(line);
    }
    
    return formattedLines;
}

/**
 * Check if a line is a section header
 * @param {string} line - The line to check
 * @returns {boolean} - Whether the line is a section header
 */
function isSection(line) {
    // Check for numbered sections (e.g., "1. Section Name")
    if (/^\d+(\.\d+)*\.\s+\S/.test(line)) {
        return true;
    }
    
    // Check for uppercase sections (e.g., "SECTION NAME")
    if (/^[A-Z][A-Z\s\-]+$/.test(line)) {
        return true;
    }
    
    // Check for alternative sections (e.g., ": Section Name")
    if (/^:\s+\S/.test(line)) {
        return true;
    }
    
    return false;
}

/**
 * Check if a line is a metadata entry
 * @param {string} line - The line to check
 * @returns {boolean} - Whether the line is a metadata entry
 */
function isMetadata(line) {
    // Metadata format: "Key          Value"
    return /^[A-Za-z][A-Za-z\s]+\s{2,}[A-Za-z0-9]/.test(line);
}

/**
 * Split a metadata line into key and value
 * @param {string} line - The metadata line
 * @returns {[string, string]} - The key and value
 */
function splitMetadata(line) {
    const match = line.match(/^([A-Za-z][A-Za-z\s]+?)\s{2,}(.+)$/);
    if (match) {
        return [match[1].trim(), match[2].trim()];
    }
    return [null, null];
}

/**
 * Check if a line is a list item
 * @param {string} line - The line to check
 * @returns {boolean} - Whether the line is a list item
 */
function isList(line) {
    // Check for bullet lists (e.g., "- Item")
    if (/^\s*-\s+\S/.test(line)) {
        return true;
    }
    
    // Check for numbered lists (e.g., "1. Item")
    if (/^\s*\d+\.\s+\S/.test(line)) {
        return true;
    }
    
    // Check for lettered lists (e.g., "a. Item")
    if (/^\s*[a-z]\.\s+\S/.test(line)) {
        return true;
    }
    
    // Check for roman numeral lists (e.g., "i. Item")
    if (/^\s*[ivxlcdm]+\.\s+\S/.test(line)) {
        return true;
    }
    
    return false;
}

/**
 * Register the format document command
 * @param {vscode.ExtensionContext} context - The extension context
 * @param {vscode.OutputChannel} outputChannel - The output channel
 */
function registerFormatCommands(context, outputChannel) {
    // Register the format document command
    const formatDocumentCommand = vscode.commands.registerCommand('txtdoc.formatDocument', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'txtdoc') {
            outputChannel.appendLine('Executing Format Document command');
            await formatDocument(editor.document);
        } else {
            vscode.window.showWarningMessage('Format Document command is only available for TxtDoc files');
        }
    });
    
    context.subscriptions.push(formatDocumentCommand);
    outputChannel.appendLine('Format Document command registered');
}

module.exports = {
    registerFormatCommands,
    formatDocument
};