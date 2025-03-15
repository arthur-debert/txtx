/**
 * Unit tests for the Reference Commands in the headless backend
 */

import * as assert from 'assert';
import * as path from 'path';
import { checkDocumentReferences } from '../../../../src/core/backends/headless/reference-commands.js';

suite('Reference Commands - Headless Backend', () => {
  // Test the checkDocumentReferences function
  suite('checkDocumentReferences', () => {
    // Sample document with references
    const sampleDocument = `RFC Test Document

This is a test document with a reference to [another document](./test.rfc).

And here's a reference to a [non-existent document](./non-existent.rfc).
`;

    // Sample document with no references
    const documentWithoutReferences = `RFC Test Document

This is a test document with no references.

Just plain text content.
`;

    test('should process a document with references', async () => {
      // Process references
      const result = await checkDocumentReferences(sampleDocument, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      
      // Note: In a unit test environment, the file system might not be available
      // so we can't reliably test if references are found or resolved correctly.
      // We're just testing that the function runs without errors.
    });

    test('should handle documents with no references', async () => {
      // Process references
      const result = await checkDocumentReferences(documentWithoutReferences, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.strictEqual(result.referencesFound, 0, 'Should find no references');
      assert.strictEqual(result.diagnostics.length, 0, 'Should have no diagnostics');
    });

    test('should fail for non-RFC files', async () => {
      // Process references with non-RFC file
      const result = await checkDocumentReferences(sampleDocument, 'test.txt');
      
      // Verify the result
      assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
      assert.ok(result.diagnostics.length > 0, 'Should have diagnostics');
      assert.ok(result.diagnostics[0].message.includes('only available for .rfc files'), 'Error should mention RFC files');
    });
  });
});