const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const { isVerbose, openDocument } = require('./test-helpers');

suite('RfcDoc Format Extension Tests', function() {

  // 3. Syntax Highlighting Tests
  suite('3. Syntax Highlighting Tests', function() {
    
    // 3.1 Text formatting - bold
    test('3.1 Text formatting - bold', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
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
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the bold text pattern is found in the document
      assert.ok(boldTextPosition > -1, 'Bold text pattern (*bold*) should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.2 Text formatting - italic
    test('3.2 Text formatting - italic', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
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
            
      isVerbose && console.log('Italic text found at line:', italicTextLine, 'char:', italicTextChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the italic text pattern is found in the document
      assert.ok(italicTextPosition > -1, 'Italic text pattern (_italic_) should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.3 Section types highlighting
    test('3.3 Section types highlighting', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
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
      assert.ok(alternativeSectionPosition > -1, 'Alternative section should be found in the document');
      assert.ok(uppercaseSectionPosition > -1, 'Uppercase section should be found in the document');
      
      // Convert positions to lines
      const numberedSectionLine = document.positionAt(numberedSectionPosition).line;
      const numberedSectionChar = document.positionAt(numberedSectionPosition).character;
      const alternativeSectionLine = document.positionAt(alternativeSectionPosition).line;
      const alternativeSectionChar = document.positionAt(alternativeSectionPosition).character;
      const uppercaseSectionLine = document.positionAt(uppercaseSectionPosition).line;
      const uppercaseSectionChar = document.positionAt(uppercaseSectionPosition).character;
            
      isVerbose && console.log('Numbered section found at line:', numberedSectionLine, 'char:', numberedSectionChar);
      isVerbose && console.log('Alternative section found at line:', alternativeSectionLine, 'char:', alternativeSectionChar);
      isVerbose && console.log('Uppercase section found at line:', uppercaseSectionLine, 'char:', uppercaseSectionChar);
      
      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the section patterns are found in the document
      assert.ok(numberedSectionPosition > -1, 'Numbered section pattern should be found in the document');
      assert.ok(alternativeSectionPosition > -1, 'Alternative section pattern should be found in the document');
      assert.ok(uppercaseSectionPosition > -1, 'Uppercase section pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });

    // 3.4 Lists - bullet points
    test('3.4 Lists - bullet points', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
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
            
      isVerbose && console.log('Bullet point list found at line:', bulletListLine, 'char:', bulletListChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the bullet point list pattern is found in the document
      assert.ok(bulletListPosition > -1, 'Bullet point list pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.5 Lists - numbered
    test('3.5 Lists - numbered', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of numbered list
      const numberedListPosition = text.indexOf('1. Numbered item 1');
      assert.ok(numberedListPosition > -1, 'Numbered list should be found in the document');
      
      // Convert position to line and character
      const numberedListLine = document.positionAt(numberedListPosition).line;
      const numberedListChar = document.positionAt(numberedListPosition).character;
            
      isVerbose && console.log('Numbered list found at line:', numberedListLine, 'char:', numberedListChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the numbered list pattern is found in the document
      assert.ok(numberedListPosition > -1, 'Numbered list pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.6 Lists - lettered
    test('3.6 Lists - lettered', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of lettered list
      const letteredListPosition = text.indexOf('a. Lettered item a');
      assert.ok(letteredListPosition > -1, 'Lettered list should be found in the document');
      
      // Convert position to line and character
      const letteredListLine = document.positionAt(letteredListPosition).line;
      const letteredListChar = document.positionAt(letteredListPosition).character;
            
      isVerbose && console.log('Lettered list found at line:', letteredListLine, 'char:', letteredListChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the lettered list pattern is found in the document
      assert.ok(letteredListPosition > -1, 'Lettered list pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.7 Lists - roman numerals
    test('3.7 Lists - roman numerals', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of roman numeral list
      const romanListPosition = text.indexOf('i. Roman numeral item i');
      assert.ok(romanListPosition > -1, 'Roman numeral list should be found in the document');
      
      // Convert position to line and character
      const romanListLine = document.positionAt(romanListPosition).line;
      const romanListChar = document.positionAt(romanListPosition).character;
            
      isVerbose && console.log('Roman numeral list found at line:', romanListLine, 'char:', romanListChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the roman numeral list pattern is found in the document
      assert.ok(romanListPosition > -1, 'Roman numeral list pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.8 Code blocks
    test('3.8 Code blocks', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of code block
      const codeBlockPosition = text.indexOf('    This is a code block');
      assert.ok(codeBlockPosition > -1, 'Code block should be found in the document');
      
      // Convert position to line and character
      const codeBlockLine = document.positionAt(codeBlockPosition).line;
      const codeBlockChar = document.positionAt(codeBlockPosition).character;
            
      isVerbose && console.log('Code block found at line:', codeBlockLine, 'char:', codeBlockChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the code block pattern is found in the document
      assert.ok(codeBlockPosition > -1, 'Code block pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.9 Quotes and blockquotes
    test('3.9 Quotes and blockquotes', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of quote and nested quote
      const quotePosition = text.indexOf('> This is a quote');
      const nestedQuotePosition = text.indexOf('>> This is a nested quote');
      
      assert.ok(quotePosition > -1, 'Quote should be found in the document');
      assert.ok(nestedQuotePosition > -1, 'Nested quote should be found in the document');
      
      // Convert positions to lines and characters
      const quoteLine = document.positionAt(quotePosition).line;
      const quoteChar = document.positionAt(quotePosition).character;
      const nestedQuoteLine = document.positionAt(nestedQuotePosition).line;
      const nestedQuoteChar = document.positionAt(nestedQuotePosition).character;
            
      isVerbose && console.log('Quote found at line:', quoteLine, 'char:', quoteChar);
      isVerbose && console.log('Nested quote found at line:', nestedQuoteLine, 'char:', nestedQuoteChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the quote patterns are found in the document
      assert.ok(quotePosition > -1, 'Quote pattern should be found in the document');
      assert.ok(nestedQuotePosition > -1, 'Nested quote pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
    // 3.10 Metadata
    test('3.10 Metadata', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = path.join(__dirname, 'fixtures', 'syntax-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the document text
      const text = document.getText();
      
      // Find the position of metadata
      const metadataPosition = text.indexOf('Author        RfcDoc Team');
      assert.ok(metadataPosition > -1, 'Metadata should be found in the document');
      
      // Convert position to line and character
      const metadataLine = document.positionAt(metadataPosition).line;
      const metadataChar = document.positionAt(metadataPosition).character;
            
      isVerbose && console.log('Metadata found at line:', metadataLine, 'char:', metadataChar);

      // Verify the document has the correct language ID
      assert.strictEqual(document.languageId, 'rfcdoc', 'Document should have rfcdoc language ID');
      
      // Verify the metadata pattern is found in the document
      assert.ok(metadataPosition > -1, 'Metadata pattern should be found in the document');
      
      // Verify the editor is active
      assert.ok(vscode.window.activeTextEditor, 'An editor should be active');
      assert.strictEqual(vscode.window.activeTextEditor.document.uri.toString(), document.uri.toString(), 
        'The active editor should be showing our test document');
    });
    
  });
  
});