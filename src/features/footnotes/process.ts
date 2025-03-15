import { FootnoteDeclaration, FootnoteProcessResult } from './types';

// Regular expressions for footnotes
const FOOTNOTE_REGEX = /^\[(\d+)\] (.+)$/gm;
const FOOTNOTE_REFERENCE_REGEX = /\[(\d+)\]/g;

/**
 * Find all footnote declarations in the text
 * @param text - The text to search for footnotes
 * @returns Array of footnote declarations
 */
export function findFootnoteDeclarations(text: string): FootnoteDeclaration[] {
    const footnoteDeclarations: FootnoteDeclaration[] = [];
    let match;
    
    // Reset the regex lastIndex
    FOOTNOTE_REGEX.lastIndex = 0;
    while ((match = FOOTNOTE_REGEX.exec(text)) !== null) {
        const footnoteNumber = match[1];
        const footnoteText = match[2];
        const position = match.index;
        
        footnoteDeclarations.push({
            originalNumber: footnoteNumber,
            text: footnoteText,
            position: position
        });
    }
    
    // Sort footnote declarations by their position in the document
    return footnoteDeclarations.sort((a, b) => a.position - b.position);
}

/**
 * Create a mapping from original footnote numbers to new sequential numbers
 * @param footnoteDeclarations - Array of footnote declarations
 * @returns Mapping from original to new numbers
 */
export function createFootnoteNumberMap(footnoteDeclarations: FootnoteDeclaration[]): Record<string, string> {
    const footnoteMap: Record<string, string> = {};
    for (let i = 0; i < footnoteDeclarations.length; i++) {
        footnoteMap[footnoteDeclarations[i].originalNumber] = (i + 1).toString();
    }
    return footnoteMap;
}

/**
 * Update footnote numbers in the text
 * @param text - The original text
 * @param footnoteMap - Mapping from original to new numbers
 * @returns The text with updated footnote numbers
 */
export function updateFootnoteNumbers(text: string, footnoteMap: Record<string, string>): string {
    let newText = '';
    let lastIndex = 0;
    
    // Process the text character by character
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '[' && i + 1 < text.length && /\d/.test(text[i + 1])) {
            // Found a potential footnote reference or declaration
            let j = i + 1;
            let numStr = '';
            while (j < text.length && /\d/.test(text[j])) {
                numStr += text[j];
                j++;
            }
            
            if (j < text.length && text[j] === ']') {
                // This is a footnote reference or declaration
                const originalNumber = numStr;
                const newNumber = footnoteMap[originalNumber];
                
                if (newNumber) {
                    newText += text.substring(lastIndex, i) + '[' + newNumber + ']';
                    lastIndex = j + 1;
                    i = j;
                }
            }
        }
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
        newText += text.substring(lastIndex);
    }
    
    return newText;
}

/**
 * Process footnotes in the text
 * @param text - The text to process
 * @returns Result of the processing
 */
export function processFootnotes(text: string): FootnoteProcessResult {
    try {
        // Find all footnote declarations
        const footnoteDeclarations = findFootnoteDeclarations(text);
        
        // If no footnotes found, return the original text
        if (footnoteDeclarations.length === 0) {
            return { success: true, newText: text };
        }
        
        // Create mapping from original to new numbers
        const footnoteMap = createFootnoteNumberMap(footnoteDeclarations);
        
        // Update footnote numbers in the text
        const newText = updateFootnoteNumbers(text, footnoteMap);
        
        return { success: true, newText };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error : new Error('Unknown error processing footnotes')
        };
    }
}