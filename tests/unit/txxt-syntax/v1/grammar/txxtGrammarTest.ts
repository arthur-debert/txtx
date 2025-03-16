import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { GrammarParser, EmbeddedLanguage, TokenizationResult } from '../../../../../src/core/txxt-syntax/txxtGrammar.js';

export class GrammarTest {
    private grammar: GrammarParser | null = null;
    private fixturesDir: string;

    constructor(fixturesDir: string) {
        this.fixturesDir = fixturesDir;
    }

    async initialize(grammarPath: string, embeddedLanguages: EmbeddedLanguage[] = []): Promise<void> {
        this.grammar = await GrammarParser.create(grammarPath, embeddedLanguages);
    }

    tokenizeLine(line: string, previousState?: unknown): TokenizationResult {
        if (!this.grammar) {
            throw new Error('Grammar not initialized. Call initialize() first.');
        }
        return this.grammar.tokenizeLine(line, previousState);
    }

    tokenizeLines(text: string): TokenizationResult[] {
        if (!this.grammar) {
            throw new Error('Grammar not initialized. Call initialize() first.');
        }
        return this.grammar.tokenizeLines(text);
    }

    getScopesAtPosition(line: string, position: number): string[] {
        if (!this.grammar) {
            throw new Error('Grammar not initialized. Call initialize() first.');
        }
        return this.grammar.getScopesAtPosition(line, position);
    }

    async testTokenization(inputFile: string, expectedFile: string): Promise<void> {
        const input = fs.readFileSync(path.join(this.fixturesDir, inputFile), 'utf8');
        const expected = JSON.parse(fs.readFileSync(path.join(this.fixturesDir, expectedFile), 'utf8'));

        const results = this.tokenizeLines(input);

        // Remove ruleStack from comparison as it's an implementation detail
        const resultsForComparison = results.map(result => ({
            tokens: result.tokens,
            line: result.line
        }));

        assert.deepEqual(resultsForComparison, expected, 'Tokenization results do not match expected output');
    }

    async testScopesAtPosition(line: string, position: number, expectedScopes: string[]): Promise<void> {
        const scopes = this.getScopesAtPosition(line, position);
        assert.deepEqual(scopes, expectedScopes, 'Scopes at position do not match expected output');
    }

    async testEmbeddedLanguage(input: string, position: number, expectedEmbeddedScope: string): Promise<void> {
        const scopes = this.getScopesAtPosition(input, position);
        assert.include(scopes, expectedEmbeddedScope, `Expected scope ${expectedEmbeddedScope} not found at position ${position}`);
    }
} 