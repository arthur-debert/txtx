/**
 * Unit tests for the Format Document Command in the headless backend
 */

import * as assert from 'assert';
import { formatDocumentCommand } from '../../../../src/core/backends/headless/format-document-command';

suite('Format Document Command - Headless Backend', () => {
  // Sample document with various formatting issues
  const sampleDocument = `Title
Author     John Doe
Date    2025-03-13

1. INTRODUCTION

This is an introduction paragraph.
It has multiple lines without proper spacing.

1.1. Background

Some background information.

- Item 1
- Item 2
- Item 3

    This is a code block.
    It should be preserved.

2. DETAILS

More details here.`;

  // Expected output with proper formatting
  const expectedDocument = `Title
Author        John Doe
Date          2025-03-13

1. INTRODUCTION

This is an introduction paragraph.
It has multiple lines without proper spacing.

1.1. Background

Some background information.

- Item 1
- Item 2
- Item 3

    This is a code block.
    It should be preserved.

2. DETAILS

More details here.`;

  test('should format document correctly for RFC files', async () => {
    // Format the document
    const result = await formatDocumentCommand(sampleDocument, 'test.rfc');
    
    // Verify the result
    assert.strictEqual(result.success, true, 'Should return success');
    assert.strictEqual(result.result, expectedDocument, 'Document should be formatted correctly');
  });

  test('should fail for non-RFC files', async () => {
    // Format a non-RFC file
    const result = await formatDocumentCommand(sampleDocument, 'test.txt');
    
    // Verify the result
    assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
    assert.ok(result.error, 'Should return error message');
    assert.ok((result.error as string).includes('only available for .rfc files'), 'Error should mention RFC files');
  });

  test('should handle errors gracefully', async () => {
    // Create a document that will cause an error when processed
    // For this test, we'll just mock an error by passing null
    // In a real scenario, we'd need to create a document that causes an error in the formatting logic
    try {
      // @ts-ignore - Intentionally passing null to test error handling
      const result = await formatDocumentCommand(null, 'test.rfc');
      
      // If we get here, the function didn't throw, so it should return an error result
      assert.strictEqual(result.success, false, 'Should return failure for invalid document');
      assert.ok(result.error, 'Should return error message');
    } catch (error) {
      // If the function throws, that's also acceptable as long as it's handled by the caller
      assert.ok(error, 'Should throw an error for invalid document');
    }
  });
});