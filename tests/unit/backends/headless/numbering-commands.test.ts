/**
 * Unit tests for the Numbering Commands in the headless backend
 */

import * as assert from 'assert';
import * as path from 'path';
import { fixDocumentNumbering } from '../../../../src/core/backends/headless/numbering-commands';

suite('Numbering Commands - Headless Backend', () => {
  // Test the fixDocumentNumbering function
  suite('fixDocumentNumbering', () => {
    // Sample document with flat list (all items are 1.)
    const flatListDocument = `1. Hello
1. There 
1. World

# this is the "template form" where users simply list items as 1. and the 
# fix / formatter should be able to order them`;

    // Expected output for flat list
    const expectedFlatListOutput = `1. Hello
2. There 
3. World

# this is the "template form" where users simply list items as 1. and the 
# fix / formatter should be able to order them`;

    // Sample document with sections
    const sectionsDocument = `1. Introduction

This is the introduction section.

1. Main Section

This is the main section.

1. Conclusion

This is the conclusion section.

# This tests basic section numbering`;

    // Expected output for sections
    const expectedSectionsOutput = `1. Introduction

This is the introduction section.

2. Main Section

This is the main section.

3. Conclusion

This is the conclusion section.

# This tests basic section numbering`;

    // Sample document with no numbering issues
    const documentWithoutNumbering = `RFC Test Document

This is a test document with no numbered lists or sections.

Just plain text content.
`;

    test('should fix flat list numbering', async () => {
      // Process numbering
      const result = await fixDocumentNumbering(flatListDocument, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.ok(result.fixedText, 'Should return fixed text');
      assert.ok(result.linesChanged > 0, 'Should have changed at least one line');
      
      // Verify the fixed text matches the expected output
      assert.strictEqual(result.fixedText, expectedFlatListOutput, 'Fixed text should match expected output');
    });

    test('should fix section numbering', async () => {
      // Process numbering
      const result = await fixDocumentNumbering(sectionsDocument, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.ok(result.fixedText, 'Should return fixed text');
      assert.ok(result.linesChanged > 0, 'Should have changed at least one line');
      
      // Verify the fixed text matches the expected output
      assert.strictEqual(result.fixedText, expectedSectionsOutput, 'Fixed text should match expected output');
    });

    test('should return original text for document without numbering', async () => {
      // Process numbering
      const result = await fixDocumentNumbering(documentWithoutNumbering, 'test.rfc');
      
      // Verify the result
      assert.ok(result.success, 'Should return success');
      assert.strictEqual(result.fixedText, documentWithoutNumbering, 'Should return original text for document without numbering');
    });

    test('should fail for non-RFC files', async () => {
      // Process numbering with non-RFC file
      const result = await fixDocumentNumbering(flatListDocument, 'test.txt');
      
      // Verify the result
      assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
      assert.ok(result.error, 'Should return error message');
      assert.ok((result.error as string).includes('only available for .rfc files'), 'Error should mention RFC files');
    });
  });
});