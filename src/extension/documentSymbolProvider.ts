import * as vscode from "vscode";
import { 
    SECTION_REGEX, 
    NUMBERED_SECTION_REGEX, 
    ALTERNATIVE_SECTION_REGEX 
} from "./constants";

/**
 * Document Symbol Provider for RfcDoc files
 * Provides outline support for titles, sections, and code blocks
 */
class RfcDocDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument, 
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        const symbols: vscode.DocumentSymbol[] = []; // Store all symbols for internal reference
        const sectionMap = new Map<string, vscode.DocumentSymbol>(); // Map to track section hierarchy by level
        const text = document.getText();
        let match: RegExpExecArray | null;
        let startPos: vscode.Position;
        let endPos: vscode.Position;
        let range: vscode.Range;
        let symbol: vscode.DocumentSymbol;

        // Find sections
        SECTION_REGEX.lastIndex = 0;
        while ((match = SECTION_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            startPos = document.positionAt(match.index);
            endPos = document.positionAt(match.index + match[0].length);
            range = new vscode.Range(startPos, endPos);
            
            symbol = new vscode.DocumentSymbol(
                match[1].trim(),
                'Section',
                vscode.SymbolKind.File,
                range,
                range
            );
            
            symbols.push(symbol);
        }

        // Find numbered sections
        NUMBERED_SECTION_REGEX.lastIndex = 0;
        while ((match = NUMBERED_SECTION_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            startPos = document.positionAt(match.index);
            endPos = document.positionAt(match.index + match[0].length);
            range = new vscode.Range(startPos, endPos);
            
            const sectionNumber = match[1];
            const sectionTitle = match[2].trim();
            const sectionLevel = sectionNumber.split('.').length;
            
            symbol = new vscode.DocumentSymbol(
                `${sectionNumber}. ${sectionTitle}`,
                'Numbered Section',
                vscode.SymbolKind.File,
                range,
                range
            );
            
            // Handle section hierarchy
            if (sectionLevel === 1) {
                // Top-level section
                symbols.push(symbol);
                sectionMap.set(sectionNumber, symbol);
            } else {
                // Nested section, find parent
                const parentNumber = sectionNumber.substring(0, sectionNumber.lastIndexOf('.'));
                const parentSymbol = sectionMap.get(parentNumber);
                
                if (parentSymbol) {
                    parentSymbol.children.push(symbol);
                } else {
                    // If parent not found, add to top level
                    symbols.push(symbol);
                }
                
                // Store this section for potential children
                sectionMap.set(sectionNumber, symbol);
            }
        }

        // Find alternative sections
        ALTERNATIVE_SECTION_REGEX.lastIndex = 0;
        while ((match = ALTERNATIVE_SECTION_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            startPos = document.positionAt(match.index);
            endPos = document.positionAt(match.index + match[0].length);
            range = new vscode.Range(startPos, endPos);
            
            symbol = new vscode.DocumentSymbol(
                match[1].trim(),
                'Alternative Section',
                vscode.SymbolKind.File,
                range,
                range
            );
            
            symbols.push(symbol);
        }

        // Find footnotes
        // We're not adding footnotes to the outline view
        
        // Find code blocks
        // We're not adding code blocks to the outline view
        
        return symbols;
    }
    
    /**
     * Find the parent symbol for a given position
     * @param symbols - The list of symbols
     * @param position - The position to find a parent for
     * @returns - The parent symbol or null if not found
     */
    findParentSymbol(symbols: vscode.DocumentSymbol[], position: vscode.Position): vscode.DocumentSymbol | null {
        for (const symbol of symbols) {
            if (symbol.range.contains(position) && 
                symbol.kind === vscode.SymbolKind.File) {
                return symbol;
            }
        }
        return null;
    }
}

export default RfcDocDocumentSymbolProvider;