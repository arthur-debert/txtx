import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { suite, test, setup, teardown } from 'mocha';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

suite('txxt Grammar Test Suite', () => {
    let fixturesDir: string;
    let grammarPath: string;

    setup(() => {
        // Set up paths relative to this test file
        fixturesDir = path.join(__dirname, '../fixtures');
        grammarPath = path.join(__dirname, '../../../../../src/core/txxt-syntax/v1/grammar/txxt.tmLanguage.json');

        // Create fixtures directory if it doesn't exist
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
    });

    test('smoke test: should be able to read grammar file', () => {
        // Read the grammar file
        const grammarContent = fs.readFileSync(grammarPath, 'utf8');
        
        // Verify we can parse it as JSON
        const grammar = JSON.parse(grammarContent);
        
        // Basic structure checks
        assert.strictEqual(grammar.scopeName, 'text.txxt', 'Grammar should have correct scope name');
        assert.ok(Array.isArray(grammar.patterns), 'Grammar should have patterns array');
    });

    teardown(() => {
        // Clean up test files
        const testFilePath = path.join(fixturesDir, 'test.txxt');
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });
}); 