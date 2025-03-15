/**
 * Unit tests for the Footnotes feature
 */

import assert from 'assert';
import {
  processFootnotes,
  FootnoteDeclaration,
  FootnoteProcessResult,
  findFootnoteDeclarations,
  createFootnoteNumberMap,
  updateFootnoteNumbers
} from '../../../../src/features/index.js';

suite('Footnotes Feature', () => {
  // Sample document with footnotes
  const sampleDocument = `RFC Test Document
-----------------
Author        John Doe
Date          2025-03-13
Status        Draft

This is a test document with footnotes[1].

Here is another reference to a footnote[2].

And here's a reference to the first footnote again[1].

[1] This is the first footnote.
[2] This is the second footnote.`;

  // Sample document with out-of-order footnotes
  const outOfOrderDocument = `RFC Test Document
-----------------
Author        John Doe
Date          2025-03-13
Status        Draft

This is a test document with footnotes[3].

Here is another reference to a footnote[1].

And here's a reference to another footnote[2].

[3] This is the third footnote.
[1] This is the first footnote.
[2] This is the second footnote.`;

  // Sample document with no footnotes
  const documentWithoutFootnotes = `RFC Test Document
-----------------
Author        John Doe
Date          2025-03-13
Status        Draft

This is a test document with no footnotes.`;

  // Test the findFootnoteDeclarations function
  test('findFootnoteDeclarations should extract footnote declarations', () => {
    // Find footnote declarations
    const declarations = findFootnoteDeclarations(sampleDocument);
    
    // Verify declarations
    assert.strictEqual(declarations.length, 2, 'Should find 2 footnote declarations');
    assert.strictEqual(declarations[0].originalNumber, '1', 'First footnote should have number 1');
    assert.strictEqual(declarations[0].text, 'This is the first footnote.', 'First footnote text should match');
    assert.strictEqual(declarations[1].originalNumber, '2', 'Second footnote should have number 2');
    assert.strictEqual(declarations[1].text, 'This is the second footnote.', 'Second footnote text should match');
  });
  
  test('findFootnoteDeclarations should return empty array for document without footnotes', () => {
    // Find footnote declarations
    const declarations = findFootnoteDeclarations(documentWithoutFootnotes);
    
    // Verify no declarations were found
    assert.strictEqual(declarations.length, 0, 'Should return empty array for document without footnotes');
  });
  
  // Test the createFootnoteNumberMap function
  test('createFootnoteNumberMap should create mapping from original to new numbers', () => {
    // Find footnote declarations
    const declarations = findFootnoteDeclarations(outOfOrderDocument);
    
    // Create mapping
    const footnoteMap = createFootnoteNumberMap(declarations);
    
    // Verify mapping
    assert.strictEqual(Object.keys(footnoteMap).length, 3, 'Should create mapping for 3 footnotes');
    assert.strictEqual(footnoteMap['3'], '1', 'Footnote 3 should be mapped to 1');
    assert.strictEqual(footnoteMap['1'], '2', 'Footnote 1 should be mapped to 2');
    assert.strictEqual(footnoteMap['2'], '3', 'Footnote 2 should be mapped to 3');
  });
  
  // Test the updateFootnoteNumbers function
  test('updateFootnoteNumbers should update footnote numbers in the text', () => {
    // Find footnote declarations
    const declarations = findFootnoteDeclarations(outOfOrderDocument);
    
    // Create mapping
    const footnoteMap = createFootnoteNumberMap(declarations);
    
    // Update footnote numbers
    const newText = updateFootnoteNumbers(outOfOrderDocument, footnoteMap);
    
    // Verify footnote numbers were updated
    assert.ok(newText.includes('footnotes[1]'), 'First reference should be updated to [1]');
    assert.ok(newText.includes('footnote[2]'), 'Second reference should be updated to [2]');
    assert.ok(newText.includes('footnote[3]'), 'Third reference should be updated to [3]');
    assert.ok(newText.includes('[1] This is the third footnote.'), 'First declaration should be updated to [1]');
    assert.ok(newText.includes('[2] This is the first footnote.'), 'Second declaration should be updated to [2]');
    assert.ok(newText.includes('[3] This is the second footnote.'), 'Third declaration should be updated to [3]');
  });
  
  // Test the processFootnotes function (integration of the three functions)
  test('processFootnotes should renumber footnotes sequentially', () => {
    // Process footnotes
    const result = processFootnotes(outOfOrderDocument);
    
    // Verify footnotes were renumbered
    assert.ok(result.success, 'Should return success');
    assert.ok(result.newText, 'Should return new text');
    assert.ok(result.newText?.includes('footnotes[1]'), 'First reference should be updated to [1]');
    assert.ok(result.newText?.includes('footnote[2]'), 'Second reference should be updated to [2]');
    assert.ok(result.newText?.includes('footnote[3]'), 'Third reference should be updated to [3]');
    assert.ok(result.newText?.includes('[1] This is the third footnote.'), 'First declaration should be updated to [1]');
    assert.ok(result.newText?.includes('[2] This is the first footnote.'), 'Second declaration should be updated to [2]');
    assert.ok(result.newText?.includes('[3] This is the second footnote.'), 'Third declaration should be updated to [3]');
  });
  
  test('processFootnotes should return original text for document without footnotes', () => {
    // Process footnotes
    const result = processFootnotes(documentWithoutFootnotes);
    
    // Verify original text is returned
    assert.ok(result.success, 'Should return success');
    assert.strictEqual(result.newText, documentWithoutFootnotes, 'Should return original text for document without footnotes');
  });
  
  test('processFootnotes should handle errors gracefully', () => {
    // Create a document that will cause an error when processed
    const invalidDocument = `This is an invalid document with a malformed footnote[1.

[1 Missing closing bracket`;
    
    // Process footnotes with invalid document
    const result = processFootnotes(invalidDocument);
    
    // Verify result is a string (even with errors, the function should return something)
    assert.ok(typeof result === 'object', 'Result should be an object');
    assert.ok('success' in result, 'Result should have a success property');
  });
});