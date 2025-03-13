import * as vscode from "vscode";
import { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } from "./constants";
import { numberFootnotes } from "./footnoteCommands";
import { sendNotification } from "./notifications";
import * as vscodeLib from "./vscode.lib";
import { formatCommands } from "../core/backends/headless";
import { isMetadata } from "../core/backends/headless/toc-generator";

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

        // Use the headless implementation to generate the TOC
        const newText = formatCommands.generateTOC(text);
        
        // If the text didn't change, there were no sections
        if (newText === text) {
            sendNotification('TOC_NO_SECTIONS');
            return false;
        }
        
        // Apply the changes to the document
        const fullRange = vscodeLib.getDocumentRange(document);
        await vscodeLib.applyEdit(editor, fullRange, newText);
        
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