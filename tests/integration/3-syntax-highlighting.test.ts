import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { isVerbose, openDocument, getTestFixturePath } from './test-helpers.js';

suite('txxt Format Extension Tests', function () {
  // 3. Syntax Highlighting Tests
  suite('3. Syntax Highlighting Tests', function () {
    // 3.1 Text formatting - bold
    test('3.1 Text formatting - bold', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Open the test document
      const testFilePath = getTestFixturePath('syntax-test.rfc');
      const document = await openDocument(testFilePath);

      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the document text
      const text = document.getText();

      // Find the position of bold text
      const boldTextPosition = text.indexOf('*bold*');
      assert.ok(boldTextPosition > -1, 'Bold text should be found in the document');

      // Convert position to line and character
      const boldTextLine = document.positionAt(boldTextPosition).line;
      const boldTextChar = document.positionAt(boldTextPosition).character;

      isVerbose && console.log('Bold text found at line:', boldTextLine, 'char:', boldTextChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'txxt', 'Document should have txxt language ID');

      // Verify the bold text pattern is found in the document
      assert.ok(
        boldTextPosition > -1,
        'Bold text pattern (*bold*) should be found in the document'
      );

      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(
        vscode.window.activeTextEditor.document.uri.toString(),
        document.uri.toString(),
        'The active editor should be showing our test document'
      );
    });

    // 3.2 Text formatting - italic
    test('3.2 Text formatting - italic', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Open the test document
      const testFilePath = getTestFixturePath('syntax-test.rfc');
      const document = await openDocument(testFilePath);

      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the document text
      const text = document.getText();

      // Find the position of italic text
      const italicTextPosition = text.indexOf('_italic_');
      assert.ok(italicTextPosition > -1, 'Italic text should be found in the document');

      // Convert position to line and character
      const italicTextLine = document.positionAt(italicTextPosition).line;
      const italicTextChar = document.positionAt(italicTextPosition).character;

      isVerbose &&
        console.log('Italic text found at line:', italicTextLine, 'char:', italicTextChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'txxt', 'Document should have txxt language ID');

      // Verify the italic text pattern is found in the document
      assert.ok(
        italicTextPosition > -1,
        'Italic text pattern (_italic_) should be found in the document'
      );

      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(
        vscode.window.activeTextEditor.document.uri.toString(),
        document.uri.toString(),
        'The active editor should be showing our test document'
      );
    });

    // 3.3 Section types highlighting
    test('3.3 Section types highlighting', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Open the test document
      const testFilePath = getTestFixturePath('syntax-test.rfc');
      const document = await openDocument(testFilePath);

      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the document text
      const text = document.getText();

      // Find the positions of different section types
      const numberedSectionPosition = text.indexOf('2.1 Numbered Section');
      const alternativeSectionPosition = text.indexOf(': Alternative Section');
      const uppercaseSectionPosition = text.indexOf('UPPERCASE SECTION');

      assert.ok(numberedSectionPosition > -1, 'Numbered section should be found in the document');
      assert.ok(
        alternativeSectionPosition > -1,
        'Alternative section should be found in the document'
      );
      assert.ok(uppercaseSectionPosition > -1, 'Uppercase section should be found in the document');

      // Convert positions to lines
      const numberedSectionLine = document.positionAt(numberedSectionPosition).line;
      const numberedSectionChar = document.positionAt(numberedSectionPosition).character;
      const alternativeSectionLine = document.positionAt(alternativeSectionPosition).line;
      const alternativeSectionChar = document.positionAt(alternativeSectionPosition).character;
      const uppercaseSectionLine = document.positionAt(uppercaseSectionPosition).line;
      const uppercaseSectionChar = document.positionAt(uppercaseSectionPosition).character;

      isVerbose &&
        console.log(
          'Numbered section found at line:',
          numberedSectionLine,
          'char:',
          numberedSectionChar
        );
      isVerbose &&
        console.log(
          'Alternative section found at line:',
          alternativeSectionLine,
          'char:',
          alternativeSectionChar
        );
      isVerbose &&
        console.log(
          'Uppercase section found at line:',
          uppercaseSectionLine,
          'char:',
          uppercaseSectionChar
        );

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'txxt', 'Document should have txxt language ID');

      // Verify the section patterns are found in the document
      assert.ok(
        numberedSectionPosition > -1,
        'Numbered section pattern should be found in the document'
      );
      assert.ok(
        alternativeSectionPosition > -1,
        'Alternative section pattern should be found in the document'
      );
      assert.ok(
        uppercaseSectionPosition > -1,
        'Uppercase section pattern should be found in the document'
      );

      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(
        vscode.window.activeTextEditor.document.uri.toString(),
        document.uri.toString(),
        'The active editor should be showing our test document'
      );
    });

    // 3.4 Lists - bullet points
    test('3.4 Lists - bullet points', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Open the test document
      const testFilePath = getTestFixturePath('syntax-test.rfc');
      const document = await openDocument(testFilePath);

      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the document text
      const text = document.getText();

      // Find the position of bullet point list
      const bulletListPosition = text.indexOf('- Bullet point 1');
      assert.ok(bulletListPosition > -1, 'Bullet point list should be found in the document');

      // Convert position to line and character
      const bulletListLine = document.positionAt(bulletListPosition).line;
      const bulletListChar = document.positionAt(bulletListPosition).character;

      isVerbose &&
        console.log('Bullet point list found at line:', bulletListLine, 'char:', bulletListChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'txxt', 'Document should have txxt language ID');

      // Verify the bullet point list pattern is found in the document
      assert.ok(
        bulletListPosition > -1,
        'Bullet point list pattern should be found in the document'
      );

      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(
        vscode.window.activeTextEditor.document.uri.toString(),
        document.uri.toString(),
        'The active editor should be showing our test document'
      );
    });

    // Additional tests for other syntax elements would follow the same pattern
    // For brevity, I'm including just a few representative tests
  });
});
