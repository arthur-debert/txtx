const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { isVerbose, openDocument, getDocumentSections } = require('./test-helpers');

suite('TxtDoc Format Extension Tests', function() {
  
  // 5. Command Tests
  suite('5. Command Tests', function() {
    
    // 5.1 Format document command
    test('5.1 Format document command', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Create a temporary test file with inconsistent formatting
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const testFilePath = path.join(tempDir, 'format-test.rfc');
      const unformattedContent = 
`RFC Format Test Document
-----------------------

Author    John Doe
Date    March 10, 2025
Version    1.0
Status    Draft

This document tests the format document command.

1. Section One
This text should be indented.
- This is a bullet point
- This is another bullet point

2. Section Two
    This is a code block.
    It should be preserved.
    
3. Section Three
> This is a quote
>> This is a nested quote`;
      
      fs.writeFileSync(testFilePath, unformattedContent);
      
      try {
        // Open the test document
        const document = await openDocument(testFilePath);
        
        // Wait for the language mode to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the editor
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor, 'Editor should be active');
        
        // Execute the format document command
        await vscode.commands.executeCommand('txtdoc.formatDocument');
        
        // Wait for the formatting to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the updated document text
        const formattedText = editor.document.getText();
        
        isVerbose && console.log('Formatted text:', formattedText);
        
        // Verify the formatting
        const lines = formattedText.split('\n');
        
        // Check title formatting
        assert.ok(lines[0].includes('RFC Format Test Document'), 'Title should be preserved');
        assert.ok(lines[1].includes('-----------------------'), 'Title underline should be preserved');
        
        // Check metadata formatting
        const authorLine = lines.find(line => line.startsWith('Author'));
        assert.ok(authorLine, 'Author metadata should exist');
        assert.ok(authorLine.includes('John Doe'), 'Author value should be preserved');
        
        // Check consistent metadata spacing
        assert.ok(/Author\s{8,}John Doe/.test(authorLine), 'Author metadata should have consistent spacing');
        
        // Check section formatting
        const sectionOneLine = lines.findIndex(line => line.includes('1. Section One'));
        assert.ok(sectionOneLine > -1, 'Section One should exist');
        
        // Check that there's a blank line after the section header
        assert.strictEqual(lines[sectionOneLine + 1], '', 'There should be a blank line after section header');
        
        // Check that bullet points are preserved
        const bulletPointLine = lines.findIndex(line => line.includes('- This is a bullet point'));
        assert.ok(bulletPointLine > -1, 'Bullet points should be preserved');
        
        // Check that code blocks are preserved
        const codeBlockLine = lines.findIndex(line => line.includes('This is a code block.'));
        assert.ok(codeBlockLine > -1, 'Code blocks should be preserved');
        assert.ok(lines[codeBlockLine].startsWith('    '), 'Code blocks should be indented with 4 spaces');
        
        // Check that quotes are preserved
        const quoteLine = lines.findIndex(line => line.includes('This is a quote'));
        assert.ok(quoteLine > -1, 'Quotes should be preserved');
        assert.ok(lines[quoteLine].startsWith('>'), 'Quotes should start with >');
        
        // Clean up - close the editor
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      } finally {
        // Clean up - delete the temporary file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
    
    // 5.2 Generate TOC command
    test('5.2 Generate TOC command', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Create a temporary test file with sections
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const testFilePath = path.join(tempDir, 'toc-test.rfc');
      const contentWithoutTOC = 
`RFC TOC Test Document
-------------------

Author        John Doe
Date          March 10, 2025
Version       1.0
Status        Draft

This document tests the generate TOC command.

1. Introduction

   This is the introduction section.

2. Main Section

   2.1 Subsection One
   
       This is subsection one.
   
   2.2 Subsection Two
   
       This is subsection two.

3. Conclusion

   This is the conclusion section.

: Special Section

   This is a special section.

UPPERCASE SECTION

   This is an uppercase section.`;
      
      fs.writeFileSync(testFilePath, contentWithoutTOC);
      
      try {
        // Open the test document
        const document = await openDocument(testFilePath);
        
        // Wait for the language mode to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the editor
        const editor = vscode.window.activeTextEditor;
        assert.ok(editor, 'Editor should be active');
        
        // Execute the generate TOC command
        await vscode.commands.executeCommand('txtdoc.generateTOC');
        
        // Wait for the TOC generation to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the updated document text
        const textWithTOC = editor.document.getText();
        
        isVerbose && console.log('Text with TOC:', textWithTOC);
        
        // Verify the TOC was generated
        assert.ok(textWithTOC.includes('TABLE OF CONTENTS'), 'TOC header should be present');
        
        // Check that all sections are in the TOC
        assert.ok(textWithTOC.includes('1. Introduction'), 'Introduction should be in TOC');
        assert.ok(textWithTOC.includes('2. Main Section'), 'Main Section should be in TOC');
        assert.ok(textWithTOC.includes('    2.1 Subsection One'), 'Subsection One should be in TOC with indentation');
        assert.ok(textWithTOC.includes('    2.2 Subsection Two'), 'Subsection Two should be in TOC with indentation');
        assert.ok(textWithTOC.includes('3. Conclusion'), 'Conclusion should be in TOC');
        assert.ok(textWithTOC.includes(': Special Section') || textWithTOC.includes('Special Section'), 'Special Section should be in TOC');
        assert.ok(textWithTOC.includes('UPPERCASE SECTION'), 'UPPERCASE SECTION should be in TOC');
        
        // Clean up - close the editor
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      } finally {
        // Clean up - delete the temporary file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
    
  });
  
});