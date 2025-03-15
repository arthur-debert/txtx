/**
 * Unit tests for the Full Formatting Command in the headless backend
 */

import assert from 'assert';
import path from 'path';
import { fullFormattingCommand } from '../../../../src/core/backends/headless/full-formatting-command.js';
import { getErrorMessage } from '../../../../src/core/error-utils.js';
import { runTransformTest, runTransformTestsInDirectory } from '../../../test-utils/transform-test-utils.js';

suite('Full Formatting Command - Headless Backend', () => {
  // Sample document with various formatting issues, sections, and footnotes
  const sampleDocument = `Title
Author     John Doe
Date    2025-03-13

1. INTRODUCTION

This is an introduction paragraph with a footnote[1].
It has multiple lines without proper spacing.

1.1. Background

Some background information with another footnote[2].

- Item 1
- Item 2
- Item 3

    This is a code block.
    It should be preserved.

2. DETAILS

More details here.

3. CONCLUSION

Concluding remarks.

[1] This is the first footnote.
[2] This is the second footnote.`;

  test('should apply full formatting correctly for RFC files', async () => {
    // Apply full formatting
    const result = await fullFormattingCommand(sampleDocument, 'test.rfc');
    
    // Verify the result
    assert.strictEqual(result.success, true, 'Should return success');
    assert.ok(result.result, 'Should return result text');
    
    const formattedText = result.result as string;
    
    // Verify formatting was applied
    assert.ok(formattedText.includes('TABLE OF CONTENTS'), 'Should include TABLE OF CONTENTS');
    assert.ok(formattedText.includes('Author        John Doe'), 'Should format metadata correctly');
    assert.ok(formattedText.includes('1. INTRODUCTION'), 'Should preserve section headers');
    assert.ok(formattedText.includes('footnote[1]'), 'Should number footnotes correctly');
    assert.ok(formattedText.includes('[1] This is the first footnote.'), 'Should preserve footnote declarations');
  });

  test('should fail for non-RFC files', async () => {
    // Apply full formatting to non-RFC file
    const result = await fullFormattingCommand(sampleDocument, 'test.txt');
    
    // Verify the result
    assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
    assert.ok(result.error, 'Should return error message');
    assert.ok(getErrorMessage(result.error).includes('only available for .rfc files'), 'Error should mention RFC files');
  });

  test('should handle errors gracefully', async () => {
    // Create a document that will cause an error when processed
    // For this test, we'll just mock an error by passing null
    try {
      // @ts-ignore - Intentionally passing null to test error handling
      const result = await fullFormattingCommand(null, 'test.rfc');
      
      // If we get here, the function didn't throw, so it should return an error result
      assert.strictEqual(result.success, false, 'Should return failure for invalid document');
      assert.ok(result.error, 'Should return error message');
    } catch (error) {
      // If the function throws, that's also acceptable as long as it's handled by the caller
      assert.ok(error, 'Should throw an error for invalid document');
    }
  });
});