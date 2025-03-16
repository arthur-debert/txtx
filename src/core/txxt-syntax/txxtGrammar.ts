import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);
const vscodeOniguruma = require('vscode-oniguruma');
const vscodeTextmate = require('vscode-textmate');

/**
 * Represents a token produced by the grammar parser
 */
export interface Token {
    startIndex: number;
    endIndex: number;
    scopes: string[];
}

/**
 * Result of tokenizing a line of text
 */
export interface TokenizationResult {
    tokens: Token[];
    line: string;
    ruleStack: unknown;
}

/**
 * Configuration for an embedded language
 */
export interface EmbeddedLanguage {
    scopeName: string;
    grammarPath: string;
}

/**
 * Interface for the Oniguruma library
 */
interface IOnigLib {
    createOnigScanner(sources: string[]): unknown;
    createOnigString(str: string): unknown;
}

/**
 * Interface for the TextMate registry
 */
interface IRegistry {
    loadGrammar(scopeName: string): Promise<IGrammar | null>;
}

/**
 * Interface for the TextMate grammar
 */
interface IGrammar {
    tokenizeLine(lineText: string, prevState: unknown, timeLimit?: number): ITokenizeLineResult;
}

/**
 * Interface for the tokenize line result
 */
interface ITokenizeLineResult {
    tokens: Token[];
    ruleStack: unknown;
}

/**
 * A simple TextMate grammar parser that can tokenize text using VSCode's TextMate implementation
 */
export class GrammarParser {
    private registry: IRegistry | null = null;
    private grammar: IGrammar | null = null;
    private static onigLib: IOnigLib | null = null;
    private grammarPath: string;
    private embeddedLanguages: EmbeddedLanguage[] = [];
    private ruleStack: unknown = null;
    private static wasmPromise: Promise<unknown> | null = null;

    private constructor(grammarPath: string, embeddedLanguages: EmbeddedLanguage[] = []) {
        this.grammarPath = grammarPath;
        this.embeddedLanguages = embeddedLanguages;
    }

    /**
     * Creates a new GrammarParser instance
     * 
     * @param grammarPath Path to the TextMate grammar file (.json or .tmLanguage)
     * @param embeddedLanguages Optional array of embedded languages
     * @returns A new GrammarParser instance
     */
    static async create(
        grammarPath: string, 
        embeddedLanguages: EmbeddedLanguage[] = []
    ): Promise<GrammarParser> {
        const instance = new GrammarParser(grammarPath, embeddedLanguages);
        await instance.initializeRegistry();
        await instance.initialize();
        return instance;
    }

    /**
     * Loads the WASM file for the Oniguruma regex engine
     */
    private static async loadOniguruma(): Promise<unknown> {
        if (!GrammarParser.wasmPromise) {
            try {
                // Try to find the WASM file in different locations
                let wasmPath = path.join(require.resolve('vscode-oniguruma'), '../onig.wasm');
                
                // Check if the file exists
                if (!fs.existsSync(wasmPath)) {
                    // Try alternative paths
                    const altPaths = [
                        path.join(process.cwd(), 'node_modules/vscode-oniguruma/release/onig.wasm'),
                        path.join(process.cwd(), 'node_modules/vscode-oniguruma/out/onig.wasm'),
                        path.join(process.cwd(), 'dist/onig.wasm')
                    ];
                    
                    for (const altPath of altPaths) {
                        if (fs.existsSync(altPath)) {
                            wasmPath = altPath;
                            break;
                        }
                    }
                    
                    if (!fs.existsSync(wasmPath)) {
                        throw new Error(`WASM file not found at ${wasmPath} or any alternative locations`);
                    }
                }
                
                // Read the WASM file as a buffer
                const wasmBin = fs.readFileSync(wasmPath);
                
                // Load the WASM file
                GrammarParser.wasmPromise = vscodeOniguruma.loadWASM(wasmBin);
                
                return GrammarParser.wasmPromise;
            } catch (error) {
                console.error('Error loading WASM:', error);
                throw error;
            }
        } else {
            return GrammarParser.wasmPromise;
        }
    }

    /**
     * Gets the Oniguruma library instance
     */
    private static async getOnigLib(): Promise<IOnigLib> {
        if (!GrammarParser.onigLib) {
            await GrammarParser.loadOniguruma();
            
            GrammarParser.onigLib = {
                createOnigScanner: (sources: string[]) => vscodeOniguruma.createOnigScanner(sources),
                createOnigString: (str: string) => vscodeOniguruma.createOnigString(str)
            };
        }
        return GrammarParser.onigLib;
    }

    /**
     * Initializes the TextMate registry
     */
    private async initializeRegistry(): Promise<void> {
        const onigLib = await GrammarParser.getOnigLib();

        this.registry = new vscodeTextmate.Registry({
            onigLib,
            loadGrammar: async (scopeName: string) => {
                try {
                    // Handle main grammar
                    if (scopeName === this.getGrammarScopeName()) {
                        const content = fs.readFileSync(this.grammarPath, 'utf8');
                        return JSON.parse(content);
                    }
                    
                    // Handle embedded languages
                    const embeddedLang = this.embeddedLanguages.find(lang => lang.scopeName === scopeName);
                    if (embeddedLang) {
                        const content = fs.readFileSync(embeddedLang.grammarPath, 'utf8');
                        return JSON.parse(content);
                    }
                    
                    return null;
                } catch (error) {
                    console.error(`Error loading grammar for scope ${scopeName}:`, error);
                    throw error;
                }
            }
        });
    }

    /**
     * Gets the scope name from the grammar file
     */
    private getGrammarScopeName(): string {
        try {
            const content = fs.readFileSync(this.grammarPath, 'utf8');
            const grammar = JSON.parse(content);
            return grammar.scopeName || 'source.unknown';
        } catch (error) {
            console.error('Error reading grammar scope name:', error);
            return 'source.unknown';
        }
    }

    /**
     * Initializes the grammar
     */
    private async initialize(): Promise<void> {
        if (!this.registry) {
            throw new Error('Registry not initialized');
        }

        // Load embedded languages
        for (const lang of this.embeddedLanguages) {
            await this.registry.loadGrammar(lang.scopeName);
        }

        // Load the main grammar
        const scopeName = this.getGrammarScopeName();
        this.grammar = await this.registry.loadGrammar(scopeName);
        
        if (!this.grammar) {
            throw new Error(`Failed to load grammar with scope name: ${scopeName}`);
        }
    }

    /**
     * Tokenizes a single line of text
     * 
     * @param line The line to tokenize
     * @param previousState Optional previous state from a previous line
     * @returns Tokenization result
     */
    tokenizeLine(line: string, previousState?: unknown): TokenizationResult {
        if (!this.grammar) {
            throw new Error('Grammar not initialized');
        }

        const prevState = previousState || this.ruleStack || null;
        const result = this.grammar.tokenizeLine(line, prevState);
        
        // Store the rule stack for subsequent calls
        this.ruleStack = result.ruleStack;
        
        return {
            tokens: result.tokens.map((token: Token) => ({
                startIndex: token.startIndex,
                endIndex: token.endIndex,
                scopes: token.scopes
            })),
            line,
            ruleStack: result.ruleStack
        };
    }

    /**
     * Tokenizes multiple lines of text
     * 
     * @param text The text to tokenize
     * @returns Array of tokenization results, one per line
     */
    tokenizeLines(text: string): TokenizationResult[] {
        const lines = text.split('\n');
        const results: TokenizationResult[] = [];
        let ruleStack = null;
        
        for (const line of lines) {
            const result = this.tokenizeLine(line, ruleStack);
            results.push(result);
            ruleStack = result.ruleStack;
        }
        
        return results;
    }

    /**
     * Gets the scopes at a specific position in a line
     * 
     * @param line The line of text
     * @param position The character position in the line
     * @returns Array of scopes at the position
     */
    getScopesAtPosition(line: string, position: number): string[] {
        if (!this.grammar) {
            throw new Error('Grammar not initialized');
        }

        const tokens = this.grammar.tokenizeLine(line, null);
        const token = tokens.tokens.find((t: Token) => 
            position >= t.startIndex && position < t.endIndex
        );

        return token ? token.scopes : [];
    }
} 