/**
 * Transform tests for the Numbering feature
 * 
 * These tests use the transform test utility to compare the transformed
 * input with the expected output.
 */

import * as path from 'path';
import { runTransformTest, runTransformTestsInDirectory } from '../../../test-utils/transform-test-utils.js';
import { fixNumbering } from '../../../../src/features/index.js';

const TRANSFORM_EXAMPLES_DIR = path.join(
  __dirname, 
  '..', 
  '..', 
  '..', 
  'integration', 
  'fixtures', 
  'transform-examples', 
  'fix-numbering'
);

suite('Numbering Feature Transform Tests', () => {
  /**
   * Transform function that extracts the fixed text from the result
   */
  const transformFn = (input: string): string => {
    const result = fixNumbering(input);
    if (!result.success || !result.fixedText) {
      throw new Error(`Failed to fix numbering: ${result.error}`);
    }
    return result.fixedText;
  };

  // Test individual examples
  test('should correctly fix flat list numbering', async () => {
    await runTransformTest({
      testDir: TRANSFORM_EXAMPLES_DIR,
      testName: 'lists-flat-template',
      transformFn
    });
  });

  // Run all tests in the directory
  test('should correctly fix all numbering examples', async function() {
    // This test might take longer if there are many examples
    this.timeout(5000);
    
    await runTransformTestsInDirectory(
      TRANSFORM_EXAMPLES_DIR,
      transformFn
    );
  });
});