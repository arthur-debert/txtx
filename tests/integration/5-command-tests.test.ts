import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  isVerbose,
  openDocument,
  getDocumentSections,
  createTestEnv,
  configureNotifications,
  enableTestNotification,
  resetNotificationConfig,
  getTestFixturePath,
  executeCommand,
  getActiveEditor,
  closeActiveEditor,
} from './test-helpers.js';

suite('txxt Format Extension Tests', function () {
  // 5. Command Tests
  suite('5. Command Tests', function () {
    // Setup: Enable notifications for testing
    setup(function () {
      // Enable notifications needed for tests
      configureNotifications({
        FORMAT_SUCCESS: true,
        TOC_SUCCESS: true,
        FOOTNOTE_SUCCESS: true,
        FULL_FORMAT_SUCCESS: true,
        NUMBERING_SUCCESS: true,
        EXPORT_SUCCESS: true,
      });
    });

    // 5.1 Format document command
    test('5.1 Format document command', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Create a test environment and temporary file
      const testEnv = createTestEnv('command-tests');
      const unformattedContent = `RFC Format Test Document
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

      const testFilePath = testEnv.createFile('format-test.rfc', unformattedContent);

      try {
        // Open the test document
        const document = await openDocument(testFilePath);

        // Wait for the language mode to be set
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the editor
        const editor = getActiveEditor();
        assert.ok(editor, 'Editor should be active');
        await executeCommand('txxt.formatDocument');
        // Wait for the formatting to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the updated document text
        const formattedText = editor.document.getText();

        isVerbose && console.log('Formatted text:', formattedText);

        // Verify the formatting
        const lines = formattedText.split('\n');

        // Check title formatting
        assert.ok(lines[0].includes('RFC Format Test Document'), 'Title should be preserved');
        assert.ok(
          lines[1].includes('-----------------------'),
          'Title underline should be preserved'
        );

        // Check metadata formatting
        const authorLine = lines.find((line: string) => line.startsWith('Author'));
        assert.ok(authorLine, 'Author metadata should exist');
        assert.ok(authorLine.includes('John Doe'), 'Author value should be preserved');

        // Check consistent metadata spacing
        assert.ok(
          /Author\s{8,}John Doe/.test(authorLine),
          'Author metadata should have consistent spacing'
        );

        // Check section formatting
        const sectionOneLine = lines.findIndex((line: string) => line.includes('1. Section One'));
        assert.ok(sectionOneLine > -1, 'Section One should exist');

        // Check that there's a blank line after the section header
        assert.strictEqual(
          lines[sectionOneLine + 1],
          '',
          'There should be a blank line after section header'
        );

        // Check that bullet points are preserved
        const bulletPointLine = lines.findIndex((line: string) => line.includes('- This is a bullet point'));
        assert.ok(bulletPointLine > -1, 'Bullet points should be preserved');

        // Check that code blocks are preserved
        const codeBlockLine = lines.findIndex((line: string) => line.includes('This is a code block.'));
        assert.ok(codeBlockLine > -1, 'Code blocks should be preserved');
        assert.ok(
          lines[codeBlockLine].startsWith('    '),
          'Code blocks should be indented with 4 spaces'
        );

        // Check that quotes are preserved
        const quoteLine = lines.findIndex((line: string) => line.includes('This is a quote'));
        assert.ok(quoteLine > -1, 'Quotes should be preserved');
        assert.ok(lines[quoteLine].startsWith('>'), 'Quotes should start with >');

        // Clean up - close the editor
        await closeActiveEditor();
      } finally {
        // Clean up - delete the temporary file
        testEnv.cleanup();
      }
    });

    // 5.7 Fix Numbering command
    test.skip('5.7 Fix Numbering command', async function () {
      this.timeout(10000); // Increase timeout for this test

      // Create a test environment and temporary file
      const testEnv = createTestEnv('command-tests');

      // Read the test fixture
      const fixturePath = getTestFixturePath('numbering-test.rfc');
      const fixtureContent = fs.readFileSync(fixturePath, 'utf8');

      const testFilePath = testEnv.createFile('numbering-test.rfc', fixtureContent);

      try {
        // Open the test document
        const document = await openDocument(testFilePath);

        // Wait for the language mode to be set
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the editor
        const editor = getActiveEditor();
        assert.ok(editor, 'Editor should be active');

        // Execute the fix numbering command
        await executeCommand('txxt.fixNumbering');

        // Wait for the numbering fix to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the updated document text
        const fixedText = editor.document.getText();

        isVerbose && console.log('Fixed text:', fixedText);

        // Verify the numbering fixes
        const lines = fixedText.split('\n');

        // Check section numbering
        const introLine = lines.findIndex((line: string) => line.includes('Introduction'));
        assert.ok(introLine > -1, 'Introduction section should exist');
        assert.ok(
          lines[introLine].startsWith('1. Introduction'),
          'Introduction should be numbered as 1'
        );

        const mainSectionLine = lines.findIndex((line: string) => line.includes('Main Section'));
        assert.ok(mainSectionLine > -1, 'Main Section should exist');
        assert.ok(
          lines[mainSectionLine].startsWith('2. Main Section'),
          'Main Section should be numbered as 2'
        );

        const subsection1Line = lines.findIndex((line: string) => line.includes('Subsection One'));
        assert.ok(subsection1Line > -1, 'Subsection One should exist');
        assert.ok(
          lines[subsection1Line].includes('2.1') &&
            lines[subsection1Line].includes('Subsection One'),
          'Subsection One should be numbered as 2.1'
        );

        const subsection2Line = lines.findIndex((line: string) => line.includes('Subsection Two'));
        assert.ok(subsection2Line > -1, 'Subsection Two should exist');
        assert.ok(
          lines[subsection2Line].includes('2.2') &&
            lines[subsection2Line].includes('Subsection Two'),
          'Subsection Two should be numbered as 2.2'
        );

        const conclusionLine = lines.findIndex((line: string) => line.includes('Conclusion'));
        assert.ok(conclusionLine > -1, 'Conclusion section should exist');
        assert.ok(
          lines[conclusionLine].startsWith('3. Conclusion'),
          'Conclusion should be numbered as 3'
        );

        // Clean up - close the editor
        await closeActiveEditor();
      } finally {
        // Clean up - delete the temporary file
        testEnv.cleanup();
      }
    });

    // Teardown: Reset notification configuration
    teardown(function () {
      resetNotificationConfig();
    });
  });
});
