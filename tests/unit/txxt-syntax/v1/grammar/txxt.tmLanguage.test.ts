/**
 * Simple test for the GrammarParser with the txxt grammar
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { assert } from 'chai';
import { describe, it, before } from 'mocha';
import { GrammarTest } from './txxtGrammarTest.js';
import { Token } from '../../../../../src/core/txxt-syntax/txxtGrammar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Txxt Grammar Tests', () => {
    const grammarPath = join(__dirname, '../../../../../src/core/txxt-syntax/v1/grammar/txxt.tmLanguage.json');
    const fixturesDir = join(__dirname, '../fixtures/txxt');
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

    it('should tokenize a simple title', async () => {
        const input = '# Title';
        const result = grammarTest.tokenizeLine(input);
        
        assert.isArray(result.tokens, 'Tokens should be an array');
        assert.isAtLeast(result.tokens.length, 1, 'Should have at least one token');
        
        // Find the title token
        const titleToken = result.tokens.find((token: Token) => token.startIndex === 0);
        
        assert.isDefined(titleToken, 'Title token should exist');
    });

    it('should get scopes at position correctly', () => {
        const input = '# Title';
        const scopes = grammarTest.getScopesAtPosition(input, 2);
        assert.isArray(scopes, 'Scopes should be an array');
    });

    it('should tokenize multiple lines correctly', () => {
        const input = '# Title\n\nThis is a paragraph.';
        const results = grammarTest.tokenizeLines(input);
        
        assert.isArray(results, 'Results should be an array');
        assert.equal(results.length, 3, 'Should have 3 lines');
    });
}); 