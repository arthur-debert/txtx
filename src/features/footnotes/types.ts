/**
 * Interface for footnote declaration
 */
export interface FootnoteDeclaration {
    originalNumber: string;
    text: string;
    position: number;
}

/**
 * Interface for the result of processing footnotes
 */
export interface FootnoteProcessResult {
    success: boolean;
    newText?: string;
    error?: any;
}