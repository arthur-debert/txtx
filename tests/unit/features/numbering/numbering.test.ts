/**
 * Unit tests for the Numbering feature
 */

import * as assert from 'assert';
import { 
  fixNumbering,
  countChangedLines
} from '../../../../src/features/numbering';

suite('Numbering Feature', () => {
  // Test the countChangedLines function
  test('countChangedLines should count the number of changed lines', () => {
    // Create two arrays with some differences
    const original = ['Line 1', 'Line 2', 'Line 3', 'Line 4'];
    const modified = ['Line 1', 'Modified Line 2', 'Line 3', 'Modified Line 4'];
    
    // Count the changes
    const changes = countChangedLines(original, modified);
    
    // Verify the count
    assert.strictEqual(changes, 2, 'Should count 2 changed lines');
  });

  test('countChangedLines should handle arrays of different lengths', () => {
    // Create two arrays with different lengths
    const original = ['Line 1', 'Line 2', 'Line 3'];
    const modified = ['Line 1', 'Modified Line 2', 'Line 3', 'New Line 4'];
    
    // Count the changes
    const changes = countChangedLines(original, modified);
    
    // Verify the count (2 changes: 1 modified line + 1 added line)
    assert.strictEqual(changes, 2, 'Should count 2 changed lines');
  });

  test('fixNumbering should handle errors gracefully', () => {
    // Create a document that will cause an error
    const invalidDocument = null as any;
    
    // Fix numbering with the invalid document
    const result = fixNumbering(invalidDocument);
    
    // Verify the result
    assert.strictEqual(result.success, false, 'Numbering fix should fail');
    assert.ok(result.error, 'Error message should be provided');
    assert.strictEqual(result.linesChanged, 0, 'No lines should be changed');
  });
});