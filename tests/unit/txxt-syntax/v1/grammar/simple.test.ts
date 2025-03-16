/**
 * Simple test for the GrammarParser with a basic grammar
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { assert } from 'chai';
import { describe, it, before } from 'mocha';
import { GrammarParser } from '../../../../../src/core/txxt-syntax/txxtGrammar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Simple Grammar Parser Tests', () => {
    const grammarPath = join(__dirname, '../../../../../src/core/txxt-syntax/v1/grammar/simple.tmLanguage.json');
    let parser: GrammarParser;

    before(async () => {
        try {
            parser = await GrammarParser.create(grammarPath);
            console.log('Simple grammar initialized successfully');
        } catch (error) {
            console.error('Error initializing grammar:', error);
            throw error;
        }
    });

    it('should tokenize keywords correctly', () => {
        const input = 'function test() { const x = 10; }';
        const result = parser.tokenizeLine(input);
        
        // Find the function keyword token
        const functionToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex) === 'function'
        );
        
        assert.isDefined(functionToken, 'Function keyword token should exist');
        if (functionToken) {
            assert.include(functionToken.scopes.join(' '), 'keyword.control', 'Should have keyword scope');
        }
        
        // Find the const keyword token
        const constToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex) === 'const'
        );
        
        assert.isDefined(constToken, 'Const keyword token should exist');
        if (constToken) {
            assert.include(constToken.scopes.join(' '), 'keyword.control', 'Should have keyword scope');
        }
    });

    it('should tokenize function names correctly', () => {
        const input = 'function test() { return 42; }';
        const result = parser.tokenizeLine(input);
        
        // Find the function name token
        const functionNameToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex).includes('test')
        );
        
        assert.isDefined(functionNameToken, 'Function name token should exist');
        if (functionNameToken) {
            assert.include(functionNameToken.scopes.join(' '), 'entity.name.function', 'Should have function name scope');
        }
    });

    it('should tokenize numbers correctly', () => {
        const input = 'const x = 42;';
        const result = parser.tokenizeLine(input);
        
        // Find the number token
        const numberToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex) === '42'
        );
        
        assert.isDefined(numberToken, 'Number token should exist');
        if (numberToken) {
            assert.include(numberToken.scopes.join(' '), 'constant.numeric', 'Should have numeric scope');
        }
    });

    it('should tokenize strings correctly', () => {
        const input = 'const message = "Hello, world!";';
        const result = parser.tokenizeLine(input);
        
        // Find the string token
        const stringToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex).includes('Hello')
        );
        
        assert.isDefined(stringToken, 'String token should exist');
        if (stringToken) {
            assert.include(stringToken.scopes.join(' '), 'string.quoted', 'Should have string scope');
        }
    });

    it('should tokenize comments correctly', () => {
        const input = '// This is a comment';
        const result = parser.tokenizeLine(input);
        
        // Find the comment token
        const commentToken = result.tokens.find(token => 
            input.substring(token.startIndex, token.endIndex).includes('This is a comment')
        );
        
        assert.isDefined(commentToken, 'Comment token should exist');
        if (commentToken) {
            assert.include(commentToken.scopes.join(' '), 'comment', 'Should have comment scope');
        }
    });

    it('should tokenize multiple lines correctly', () => {
        const input = 'function test() {\n  // A comment\n  return 42;\n}';
        const results = parser.tokenizeLines(input);
        
        assert.equal(results.length, 4, 'Should have 4 lines');
        
        // Check the comment line
        const commentLine = results[1];
        const commentToken = commentLine.tokens.find(token => 
            commentLine.line.substring(token.startIndex, token.endIndex).includes('A comment')
        );
        
        assert.isDefined(commentToken, 'Comment token should exist');
        if (commentToken) {
            assert.include(commentToken.scopes.join(' '), 'comment', 'Should have comment scope');
        }
    });

    it('should get scopes at position correctly', () => {
        const input = 'function test() { return 42; }';
        
        // Check scope at 'function' keyword
        const functionScopes = parser.getScopesAtPosition(input, 2);
        assert.include(functionScopes.join(' '), 'keyword.control', 'Should have keyword scope at position 2');
        
        // Check scope at function name
        const nameScopes = parser.getScopesAtPosition(input, 10);
        assert.include(nameScopes.join(' '), 'entity.name.function', 'Should have function name scope at position 10');
        
        // Check scope at number
        const numberScopes = parser.getScopesAtPosition(input, 25);
        assert.include(numberScopes.join(' '), 'constant.numeric', 'Should have numeric scope at position 25');
    });
}); 