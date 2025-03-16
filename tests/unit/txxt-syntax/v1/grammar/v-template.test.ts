/**
 * Template for creating new grammar tests
 * 
 * Setup Process:
 * 1. Create a new test file in tests/unit/txxt-syntax/v1/grammar/
 * 2. Copy this template and rename it to your test file
 * 3. Create a fixtures directory for your test cases:
 *    mkdir -p tests/unit/txxt-syntax/v1/fixtures/your-test-category
 * 4. Add your test cases as .txtx files in the fixtures directory
 * 5. Update the test file with your specific test cases
 * 
 * Running Tests:
 * - Run all unit tests: npm test
 * - Run just this test: npm test tests/unit/txxt-syntax/v1/grammar/your-test-file.test.ts
 * 
 * Note: Make sure you've run npm run compile first if you've made changes to the grammar
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { assert } from 'chai';
import * as fs from 'fs';
import { describe, it, before, afterEach } from 'mocha';
import { GrammarTest } from './txxtGrammarTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Grammar Parser Tests', () => {
    const grammarPath = join(__dirname, '../../../../../src/core/txxt-syntax/v1/grammar/v-template.tmLanguage.json');
    const fixturesDir = join(__dirname, '../fixtures/templates');
    let grammarTest: GrammarTest;

    before(async () => {
        try {
            grammarTest = new GrammarTest(fixturesDir);
            await grammarTest.initialize(grammarPath);
            console.log('Grammar initialized successfully');
        } catch (error) {
            console.error('Error initializing grammar:', error);
            throw error;
        }
    });

    it('should tokenize a simple line', async () => {
        const input = 'Hello world';
        const result = grammarTest.tokenizeLine(input);
        
        assert.isArray(result.tokens, 'Tokens should be an array');
        assert.isAtLeast(result.tokens.length, 1, 'Should have at least one token');
    });

    it('should get scopes at position correctly', () => {
        const input = 'Hello world';
        const scopes = grammarTest.getScopesAtPosition(input, 3);
        assert.isArray(scopes, 'Scopes should be an array');
    });

    it('should tokenize multiple lines correctly', () => {
        const input = 'Line 1\nLine 2\nLine 3';
        const results = grammarTest.tokenizeLines(input);
        
        assert.isArray(results, 'Results should be an array');
        assert.equal(results.length, 3, 'Should have 3 lines');
    });

    it('smoke test: should be able to read grammar file', () => {
        // Read the grammar file
        const grammarContent = fs.readFileSync(grammarPath, 'utf8');
        
        // Verify we can parse it as JSON
        const grammar = JSON.parse(grammarContent);
        
        // Basic structure checks
        assert.ok(grammar.scopeName, 'Grammar should have a scope name');
        assert.ok(Array.isArray(grammar.patterns), 'Grammar should have patterns array');
    });

    it('should tokenize a template variable', async () => {
        const input = '{{ variable }}';
        const result = grammarTest.tokenizeLine(input);
        
        assert.isArray(result.tokens, 'Tokens should be an array');
        assert.isAtLeast(result.tokens.length, 1, 'Should have at least one token');
        
        // Check that the tokens have the correct scopes
        const variableToken = result.tokens.find(token => 
            token.startIndex <= 3 && token.endIndex >= 11
        );
        
        assert.isDefined(variableToken, 'Variable token should exist');
    });

    it('should tokenize mixed content correctly', () => {
        const input = '# Title with {{ variable }}\n\nThis is a paragraph with {{ another_var }}.';
        const results = grammarTest.tokenizeLines(input);
        
        assert.isArray(results, 'Results should be an array');
        assert.equal(results.length, 3, 'Should have 3 lines');
        
        // Check first line (title with variable)
        const titleLine = results[0];
        assert.isArray(titleLine.tokens, 'Title line tokens should be an array');
        
        // Check third line (paragraph with variable)
        const paragraphLine = results[2];
        assert.isArray(paragraphLine.tokens, 'Paragraph line tokens should be an array');
        
        // Find variable tokens
        const titleVarToken = titleLine.tokens.find(token => 
            token.startIndex <= 13 && token.endIndex >= 21
        );
        
        const paragraphVarToken = paragraphLine.tokens.find(token => 
            token.startIndex <= 24 && token.endIndex >= 35
        );
        
        assert.isDefined(titleVarToken, 'Title variable token should exist');
        assert.isDefined(paragraphVarToken, 'Paragraph variable token should exist');
    });

    it('should handle rule stack between lines', () => {
        const input = '```\n{{ code_var }}\n```';
        const results = grammarTest.tokenizeLines(input);
        
        assert.isArray(results, 'Results should be an array');
        assert.equal(results.length, 3, 'Should have 3 lines');
    });

    afterEach(() => {
        // Clean up test files
        const testFilePath = join(fixturesDir, 'test.txxt');
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });
}); 