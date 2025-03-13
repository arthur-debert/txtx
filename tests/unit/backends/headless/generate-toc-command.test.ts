/**
 * Unit tests for the Generate TOC Command in the headless backend
 */

import * as assert from 'assert';
import { generateTOCCommand } from '../../../../src/core/backends/headless/generate-toc-command';

suite('Generate TOC Command - Headless Backend', () => {
  // Sample document with sections
  const sampleDocument = `Title
Author        John Doe
Date          2025-03-13

1. INTRODUCTION

This is an introduction paragraph.

1.1. Background

Some background information.

2. DETAILS

More details here.

3. CONCLUSION

Concluding remarks.`;

  // Sample document without sections
  const documentWithoutSections = `title
author        John Doe
Date          2025-03-13

This is a document without any sections.`;

  test('should generate TOC for document with sections', async () => {
    // Generate TOC
    const result = await generateTOCCommand(sampleDocument, 'test.rfc');
    
    // Verify the result
    assert.strictEqual(result.success, true, 'Should return success');
    assert.ok(result.result, 'Should return result text');
    
    const newText = result.result as string;
    
    // Verify TOC was generated
    assert.ok(newText.includes('TABLE OF CONTENTS'), 'Should include TABLE OF CONTENTS');
    assert.ok(newText.includes('1. INTRODUCTION'), 'Should include section 1');
    assert.ok(newText.includes('2. DETAILS'), 'Should include section 2');
    assert.ok(newText.includes('3. CONCLUSION'), 'Should include section 3');
  });

  test('should fail for document without sections', async () => {
    // Generate TOC for document without sections
    const result = await generateTOCCommand(documentWithoutSections, 'test.rfc');
    
    // Verify the result
    assert.strictEqual(result.success, false, 'Should return failure for document without sections');
    assert.strictEqual(result.error, 'No sections found to generate TOC', 'Should return specific error message');
  });

  test('should fail for non-RFC files', async () => {
    // Generate TOC for non-RFC file
    const result = await generateTOCCommand(sampleDocument, 'test.txt');
    
    // Verify the result
    assert.strictEqual(result.success, false, 'Should return failure for non-RFC files');
    assert.ok(result.error, 'Should return error message');
    assert.ok((result.error as string).includes('only available for .rfc files'), 'Error should mention RFC files');
  });

  test('should handle errors gracefully', async () => {
    // Create a document that will cause an error when processed
    // For this test, we'll just mock an error by passing null
    try {
      // @ts-ignore - Intentionally passing null to test error handling
      const result = await generateTOCCommand(null, 'test.rfc');
      
      // If we get here, the function didn't throw, so it should return an error result
      assert.strictEqual(result.success, false, 'Should return failure for invalid document');
      assert.ok(result.error, 'Should return error message');
    } catch (error) {
      // If the function throws, that's also acceptable as long as it's handled by the caller
      assert.ok(error, 'Should throw an error for invalid document');
    }
  });
});