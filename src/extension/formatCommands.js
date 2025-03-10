const vscode = require("vscode");
const { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } = require("./constants");
const { numberFootnotes } = require("./footnoteCommands");

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
 * Generate a table of contents based on the document's sections
 * @param {vscode.TextDocument} document - The document to generate TOC for
 * @returns {Promise<boolean>} - Whether the TOC generation was successful
 */
async function generateTOC(document) {
    // Only generate TOC for RFC files
    if (document.languageId !== 'txtdoc' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showWarningMessage('Generate TOC command is only available for .rfc files');
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

        // Find all sections in the document
        const sections = findSections(text);
        
        if (sections.length === 0) {
            vscode.window.showWarningMessage('No sections found in the document');
            return false;
        }
        
        // Generate the TOC lines
        const tocLines = generateTOCLines(sections);
        
        // Find the position to insert the TOC
        const tocPosition = findTOCPosition(lines);
        
        // Check if there's an existing TOC to replace
        const existingTOC = findExistingTOC(lines, tocPosition);
        
        // Insert or replace the TOC
        if (existingTOC) {
            // Replace the existing TOC
            const startLine = existingTOC.startLine;
            const endLine = existingTOC.endLine;
            
            const range = new vscode.Range(
                new vscode.Position(startLine, 0),
                new vscode.Position(endLine, lines[endLine].length)
            );
            
            await editor.edit(editBuilder => {
                editBuilder.replace(range, tocLines.join('\n'));
            });
        } else {
            // Insert a new TOC
            const position = new vscode.Position(tocPosition, 0);
            
            await editor.edit(editBuilder => {
                editBuilder.insert(position, tocLines.join('\n') + '\n\n');
            });
        }
        
        vscode.window.showInformationMessage('Table of contents generated successfully');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating table of contents: ${error.message}`);
        return false;
    }
}

/**
 * Apply full formatting to the document
 * @param {vscode.TextDocument} document - The document to format
 * @returns {Promise<boolean>} - Whether the formatting was successful
 */
async function fullFormatting(document) {
    // Only format RFC files
    if (document.languageId !== 'txtdoc' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showWarningMessage('Full Formatting command is only available for .rfc files');
        return false;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return false;
    }

    try {
        // Apply all formatting commands in sequence
        const formatResult = await formatDocument(document);
        if (!formatResult) {
            return false;
        }

        const tocResult = await generateTOC(document);
        if (!tocResult) {
            return false;
        }

        const footnoteResult = await numberFootnotes(document);
        
        vscode.window.showInformationMessage('Full formatting applied successfully');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error applying full formatting: ${error.message}`);
        return false;
    }
}

/**
 * Find all sections in the document text
 * @param {string} text - The document text
 * @returns {Array<{name: string, level: number, line: number, prefix: string}>} - The sections
 */
function findSections(text) {
    const sections = [];
    const lines = text.split('\n');
    
    // Find uppercase sections
    SECTION_REGEX.lastIndex = 0;
    let match;
    while ((match = SECTION_REGEX.exec(text)) !== null) {
        const lineIndex = text.substring(0, match.index).split('\n').length - 1;
        sections.push({
            name: match[1].trim(),
            level: 1,
            line: lineIndex,
            prefix: ''
        });
    }
    
    // Find numbered sections
    NUMBERED_SECTION_REGEX.lastIndex = 0;
    while ((match = NUMBERED_SECTION_REGEX.exec(text)) !== null) {
        const lineIndex = text.substring(0, match.index).split('\n').length - 1;
        const sectionNumber = match[1];
        const sectionTitle = match[2].trim();
        const sectionLevel = sectionNumber.split('.').length;
        
        sections.push({
            name: `${sectionNumber}. ${sectionTitle}`,
            level: sectionLevel,
            line: lineIndex,
            prefix: `${sectionNumber}.`
        });
    }
    
    // Find alternative sections
    ALTERNATIVE_SECTION_REGEX.lastIndex = 0;
    while ((match = ALTERNATIVE_SECTION_REGEX.exec(text)) !== null) {
        const lineIndex = text.substring(0, match.index).split('\n').length - 1;
        sections.push({
            name: `: ${match[1].trim()}`,
            level: 1,
            line: lineIndex,
            prefix: ':'
        });
    }
    
    // Sort sections by line number
    sections.sort((a, b) => a.line - b.line);
    
    return sections;
}

/**
 * Generate TOC lines based on the sections
 * @param {Array<{name: string, level: number, line: number, prefix: string}>} sections - The sections
 * @returns {string[]} - The TOC lines
 * @returns {string[]} - The TOC lines
 */
function generateTOCLines(sections) {
    const tocLines = [
        'TABLE OF CONTENTS',
        '-----------------',
        ''
    ];
    
    for (const section of sections) {
        // Add indentation for subsections
        const indent = section.level > 1 ? '    ' : '';
        
        // Add the section to the TOC
        tocLines.push(`${indent}${section.name.trim()}`);
    }
    
    return tocLines;
}

/**
 * Find the position to insert the TOC
 * @param {string[]} lines - The document lines
 * @returns {number} - The line number to insert the TOC
 */
function findTOCPosition(lines) {
    // Look for the end of the metadata section
    let inMetadata = false;
    let metadataEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (isMetadata(line)) {
            inMetadata = true;
            metadataEnd = i;
        } else if (inMetadata && line === '') {
            // End of metadata section
            return metadataEnd + 2;
        }
    }
    
    // If no metadata section, look for the first blank line after the title
    if (lines.length > 2 && lines[1].match(/^-+$/)) {
        // Title with underline
        for (let i = 2; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                return i + 1;
            }
        }
    }
    
    // Default to line 3 (after title)
    return Math.min(3, lines.length);
}

/**
 * Find an existing TOC in the document
 * @param {string[]} lines - The document lines
 * @param {number} startPosition - The position to start looking from
 * @returns {null|{startLine: number, endLine: number}} - The existing TOC or null
 */
function findExistingTOC(lines, startPosition) {
    // Look for "TABLE OF CONTENTS" header
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === 'TABLE OF CONTENTS') {
            // Found TOC header
            const startLine = i;
            
            // Find the end of the TOC
            let endLine = startLine;
            for (let j = startLine + 1; j < lines.length; j++) {
                if (lines[j].trim() === '' && j + 1 < lines.length && isSection(lines[j + 1].trim())) {
                    // Found a blank line followed by a section
                    endLine = j;
                    break;
                }
                endLine = j;
            }
            
            return { startLine, endLine };
        }
    }
    
    return null;
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
    
    // Register the generate TOC command
    const generateTOCCommand = vscode.commands.registerCommand('txtdoc.generateTOC', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'txtdoc') {
            outputChannel.appendLine('Executing Generate TOC command');
            await generateTOC(editor.document);
        } else {
            vscode.window.showWarningMessage('Generate TOC command is only available for TxtDoc files');
        }
    });
    
    // Register the full formatting command
    const fullFormattingCommand = vscode.commands.registerCommand('txtdoc.fullFormatting', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'txtdoc') {
            outputChannel.appendLine('Executing Full Formatting command');
            await fullFormatting(editor.document);
        } else {
            vscode.window.showWarningMessage('Full Formatting command is only available for TxtDoc files');
        }
    });
    
    context.subscriptions.push(formatDocumentCommand);
    context.subscriptions.push(generateTOCCommand);
    context.subscriptions.push(fullFormattingCommand);
    outputChannel.appendLine('Format Document command registered');
    outputChannel.appendLine('Generate TOC command registered');
    outputChannel.appendLine('Full Formatting command registered');
}

module.exports = {
    registerFormatCommands,
    formatDocument,
    generateTOC,
    fullFormatting
};