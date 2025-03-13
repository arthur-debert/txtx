/**
 * Unit tests for the Footnote Commands in the headless backend
 */

import * as assert from 'assert';
import * as path from 'path';
import { numberFootnotes } from '../../../../src/core/backends/headless/footnote-commands';

suite('Footnote Commands - Headless Backend', () => {
  // Test the numberFootnotes function
  suite('numberFootnotes', () => {
    // Sample document with footnotes
    const sampleDocument = `RFC Test Document

This is a test document with footnotes[1].

Here is another reference to a footnote[2].

And here's a reference to the first footnote again[1].

[1] This is the first footnote.
[2] This is the second footnote.`;

    // Sample document with out-of-order footnotes
    const outOfOrderDocument = `RFC Test Document

This is a test document with footnotes[3].

Here is another reference to a footnote[1].

And here's a reference to another footnote[2].

[3] This is the third footnote.
[1] This is the first footnote.
[2] This is the second footnote.`;

    // Sample document with no footnotes
    const documentWithoutFootnotes = `RFC Test Document

This is a test document with no footnotes.`;

    // Invalid document with malformed footnote
    const invalidDocument = `This is an invalid document with a malformed footnote[1.

[1 This is a malformed footnote.`;

    test('should number footnotes sequentially for valid document', async () => {
      // Process footnotes
      const result = await numberFootnotes(outOfOrderDocument, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.ok(result.result, 'Should return result text');
      
      const newText = result.result as string;
      
      // Verify footnotes were renumbered
      assert.ok(newText.includes('footnotes[1]'), 'First reference should be updated to [1]');
      assert.ok(newText.includes('footnote[2]'), 'Second reference should be updated to [2]');
      assert.ok(newText.includes('footnote[3]'), 'Third reference should be updated to [3]');
      assert.ok(newText.includes('[1] This is the third footnote.'), 'First declaration should be updated to [1]');
      assert.ok(newText.includes('[2] This is the first footnote.'), 'Second declaration should be updated to [2]');
      assert.ok(newText.includes('[3] This is the second footnote.'), 'Third declaration should be updated to [3]');
    });

    test('should return original text for document without footnotes', async () => {
      // Process footnotes
      const result = await numberFootnotes(documentWithoutFootnotes, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.strictEqual(result.result, documentWithoutFootnotes, 'Should return original text for document without footnotes');
    });

    test('should fail for non-RFC files', async () => {
      // Process footnotes with non-RFC file
      const result = await numberFootnotes(sampleDocument, 'test.txt');
      
      // Verify the result
      assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
      assert.ok(result.error, 'Should return error message');
      assert.ok((result.error as string).includes('only available for .rfc files'), 'Error should mention RFC files');
    });

    test('should handle malformed footnotes gracefully', async () => {
      // Process footnotes with invalid document
      const result = await numberFootnotes(invalidDocument, 'test.rfc');
      
      // The function should not throw and should return success
      // since the processFootnotes function doesn't consider malformed footnotes as errors
      // It just doesn't find any footnote declarations that match the regex
      assert.strictEqual(result.success, true, 'Should return success even for malformed footnotes');
      assert.strictEqual(result.result, invalidDocument, 'Should return original text for malformed footnotes');
    });
  });
});