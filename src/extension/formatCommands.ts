import * as vscode from "vscode";
import { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } from "./constants";
import { numberFootnotes } from "./footnoteCommands";
import { sendNotification } from "./notifications";
import * as vscodeLib from "./vscode.lib";

/**
 * Format a document according to the RFC specification
 * @param document - The document to format
 * @returns - Whether the formatting was successful
 */
async function formatDocument(document: vscode.TextDocument): Promise<boolean> {
    // Only format RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
        sendNotification('FORMAT_RFC_ONLY');
        return false;
    }

    const editor = vscodeLib.getActiveEditor();
    if (!editor) {
        sendNotification('FORMAT_NO_EDITOR');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        const lines = text.split('\n');
        
        // Apply formatting rules
        const formattedLines = formatLines(lines);
        
        // Replace the entire document text
        const fullRange = vscodeLib.getDocumentRange(document);
        
        await vscodeLib.applyEdit(editor, fullRange, formattedLines.join('\n'));
        sendNotification('FORMAT_SUCCESS');
        return true;
    } catch (error) {
        sendNotification('FORMAT_ERROR', error);
        return false;
    }
}

/**
 * Generate a table of contents based on the document's sections
 * @param document - The document to generate TOC for
 * @returns - Whether the TOC generation was successful
 */
async function generateTOC(document: vscode.TextDocument): Promise<boolean> {
    // Only generate TOC for RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
        sendNotification('TOC_RFC_ONLY');
        return false;
    }

    const editor = vscodeLib.getActiveEditor();
    if (!editor) {
        sendNotification('TOC_NO_EDITOR');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        const lines = text.split('\n');

        // Find all sections in the document
        const sections = vscodeLib.findSections(text, SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX);
        
        if (sections.length === 0) {
            sendNotification('TOC_NO_SECTIONS');
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

            await vscodeLib.applyEdit(editor, range, tocLines.join('\n'));
        } else {
            // Insert a new TOC
            const position = new vscode.Position(tocPosition, 0);
            await editor.edit(editBuilder => { 
                editBuilder.insert(position, tocLines.join('\n') + '\n\n');
            });
        }
        
        sendNotification('TOC_SUCCESS');
        return true;
    } catch (error) {
        sendNotification('TOC_ERROR', error);
        return false;
    }
}

/**
 * Apply full formatting to the document
 * @param document - The document to format
 * @returns - Whether the formatting was successful
 */
async function fullFormatting(document: vscode.TextDocument): Promise<boolean> {
    // Only format RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
        sendNotification('FULL_FORMAT_RFC_ONLY');
        return false;
    }

    const editor = vscodeLib.getActiveEditor();
    if (!editor) {
        sendNotification('FULL_FORMAT_NO_EDITOR');
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
        
        sendNotification('FULL_FORMAT_SUCCESS');
        return true;
    } catch (error) {
        sendNotification('FULL_FORMAT_ERROR', error);
        return false;
    }
}

/**
 * Generate TOC lines based on the sections
 * @param sections - The sections
 * @returns - The TOC lines
 */
function generateTOCLines(sections: Array<{name: string, level: number, line: number, prefix: string}>): string[] {
    const tocLines = [
        'TABLE OF CONTENTS',
        '-----------------',
        ''
    ];
    
    for (const section of sections) {
        // Add indentation for subsections (single level of indentation)
        const indent = section.level > 1 ? '    ' : '';
        
        // Add the section to the TOC
        tocLines.push(`${indent}${section.name.trim()}`);
    }
    
    return tocLines;
}

/**
 * Find the position to insert the TOC
 * @param lines - The document lines
 * @returns - The line number to insert the TOC
 */
function findTOCPosition(lines: string[]): number {
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
 * @param lines - The document lines
 * @param startPosition - The position to start looking from
 * @returns - The existing TOC or null
 */
function findExistingTOC(lines: string[], startPosition: number): {startLine: number, endLine: number} | null {
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
 * @param lines - The lines to format
 * @returns - The formatted lines
 */
function formatLines(lines: string[]): string[] {
    const formattedLines: string[] = [];
    let inSection = false;
    let inList = false;
    let inCodeBlock = false;
    let inQuote = false;
    let inMetadata = false;
    let skipNextLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        // Skip this line if it was marked to be skipped
        if (skipNextLine) {
            skipNextLine = false;
            continue;
        }
        
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
            formattedLines.push('');
            
            // Skip the next line if it's already blank to avoid double blank lines
            if (i < lines.length - 1 && lines[i + 1].trim() === '') {
                skipNextLine = true;
            }
            
            // Continue to the next line
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
 * @param line - The line to check
 * @returns - Whether the line is a section header
 */
function isSection(line: string): boolean {
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
 * @param line - The line to check
 * @returns - Whether the line is a metadata entry
 */
function isMetadata(line: string): boolean {
    // Metadata format: "Key          Value"
    return /^[A-Za-z][A-Za-z\s]+\s{2,}[A-Za-z0-9]/.test(line);
}

/**
 * Split a metadata line into key and value
 * @param line - The metadata line
 * @returns - The key and value
 */
function splitMetadata(line: string): [string | null, string | null] {
    const match = line.match(/^([A-Za-z][A-Za-z\s]+?)\s{2,}(.+)$/);
    if (match) {
        return [match[1].trim(), match[2].trim()];
    }
    return [null, null];
}

/**
 * Check if a line is a list item
 * @param line - The line to check
 * @returns - Whether the line is a list item
 */
function isList(line: string): boolean {
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
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerFormatCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
    // Register commands using vscodeLib
    const formatDocumentCommand = vscodeLib.registerCommand(
        context, 
        'rfcdoc.formatDocument', 
        formatDocument, 
        outputChannel
    );
    
    const generateTOCCommand = vscodeLib.registerCommand(context, 'rfcdoc.generateTOC', generateTOC, outputChannel);
    
    const fullFormattingCommand = vscodeLib.registerCommand(context, 'rfcdoc.fullFormatting', fullFormatting, outputChannel);
    
    // Log registration
    outputChannel.appendLine('Format Document command registered');
    outputChannel.appendLine('Generate TOC command registered');
    outputChannel.appendLine('Full Formatting command registered');
}

export {
    registerFormatCommands,
    formatDocument,
    generateTOC,
    fullFormatting
};