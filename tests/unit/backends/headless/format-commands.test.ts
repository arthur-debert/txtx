/**
 * Unit tests for the Format Commands in the headless backend
 */

import * as assert from 'assert';
import * as path from 'path';
import { formatCommands } from '../../../../src/core/backends/headless/format-commands';
import { runTransformTest, runTransformTestsInDirectory } from '../../../test-utils/transform-test-utils';

// Create a directory for format document test fixtures
const TRANSFORM_EXAMPLES_DIR = path.join(
  __dirname, 
  '..', 
  '..', 
  '..', 
  'integration', 
  'fixtures', 
  'transform-examples', 
  'format-document'
);

suite('Format Commands - Headless Backend', () => {
  // Test the formatDocument function
  suite('formatDocument', () => {
    // Transform function that uses the formatDocument function
    const transformFn = (input: string): string => {
      return formatCommands.formatDocument(input);
    };

    // Test using the transform test utilities
    test('should format basic document correctly', async () => {
      await runTransformTest({
        testDir: TRANSFORM_EXAMPLES_DIR,
        testName: 'basic-formatting',
        transformFn
      });
    });

    test('should format sections correctly', async () => {
      await runTransformTest({
        testDir: TRANSFORM_EXAMPLES_DIR,
        testName: 'section-formatting',
        transformFn
      });
    });

    test('should format metadata correctly', async () => {
      await runTransformTest({
        testDir: TRANSFORM_EXAMPLES_DIR,
        testName: 'metadata-formatting',
        transformFn
      });
    });

    // Run all tests in the directory
    test('should correctly format all examples', async function() {
      // This test might take longer if there are many examples
      this.timeout(5000);
      
      await runTransformTestsInDirectory(
        TRANSFORM_EXAMPLES_DIR,
        transformFn
      );
    });

    // Basic test for formatDocument
    test('should format a document correctly', () => {
      // Sample input with various formatting issues
      const input = `Title
Author        John Doe
Date      2025-03-13

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
      const expected = `Title
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

      // Format the document
      const result = formatCommands.formatDocument(input);
      
      // Verify the result
      assert.strictEqual(result, expected, 'Document should be formatted correctly');
    });

    // Test handling of section headers
    test('should format section headers with proper spacing', () => {
      // Sample input with section header spacing issues
      const input = `1. SECTION ONE
Some content.
2. SECTION TWO
More content.`;

      // Expected output with proper spacing
      const expected = `1. SECTION ONE

Some content.

2. SECTION TWO

More content.`;

      // Format the document
      const result = formatCommands.formatDocument(input);
      
      // Verify the result
      assert.strictEqual(result, expected, 'Section headers should have proper spacing');
    });

    // Test handling of metadata
    test('should format metadata with consistent spacing', () => {
      // Sample input with inconsistent metadata spacing
      const input = `Title     Document Title
Author   John Doe
Date  2025-03-13
Status    Draft`;

      // Expected output with consistent spacing
      const expected = `Title         Document Title
Author        John Doe
Date          2025-03-13
Status        Draft`;

      // Format the document
      const result = formatCommands.formatDocument(input);
      
      // Verify the result
      assert.strictEqual(result, expected, 'Metadata should have consistent spacing');
    });

    // Test handling of lists
    test('should preserve list formatting', () => {
      // Sample input with lists
      const input = `- Item 1
- Item 2
- Item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

a. Lettered item a
b. Lettered item b
c. Lettered item c`;

      // Expected output (should be the same)
      const expected = `- Item 1
- Item 2
- Item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

a. Lettered item a
b. Lettered item b
c. Lettered item c`;

      // Format the document
      const result = formatCommands.formatDocument(input);
      
      // Verify the result
      assert.strictEqual(result, expected, 'List formatting should be preserved');
    });

    // Test handling of code blocks
    test('should preserve code block formatting', () => {
      // Sample input with code blocks
      const input = `Some text.

    This is a code block.
    It should be preserved exactly as is.
    Including indentation and spacing.

More text.`;

      // Expected output (should be the same)
      const expected = `Some text.

    This is a code block.
    It should be preserved exactly as is.
    Including indentation and spacing.

More text.`;

      // Format the document
      const result = formatCommands.formatDocument(input);
      
      // Verify the result
      assert.strictEqual(result, expected, 'Code block formatting should be preserved');
    });
  });

  // Test the generateTOC function
  suite('generateTOC', () => {
    test('should generate a table of contents', () => {
      // This is a basic test that relies on the toc feature
      // The toc feature should have its own comprehensive tests
      const input = `Title
Author        John Doe
Date          2025-03-13

1. INTRODUCTION

2. DETAILS

3. CONCLUSION`;

      // Format the document
      const result = formatCommands.generateTOC(input);
      
      // Verify that a TOC was added (simple check)
      assert.ok(result.includes('TABLE OF CONTENTS'), 'TOC should be added');
    });
  });

  // Test the fullFormatting function
  suite('fullFormatting', () => {
    test('should apply all formatting operations', () => {
      // This is a basic test that relies on the other functions
      // Each function should have its own comprehensive tests
      const input = `Title
Author     John Doe
Date    2025-03-13

1. INTRODUCTION
Some content.

2. DETAILS
More content.`;

      // Format the document
      const result = formatCommands.fullFormatting(input);
      
      // Verify that formatting was applied
      assert.ok(result.includes('Author        John Doe'), 'Metadata should be formatted');
      assert.ok(result.includes('1. INTRODUCTION\n\nSome content.'), 'Sections should be formatted');
    });
  });
});