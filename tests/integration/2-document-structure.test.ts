import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { isVerbose, openDocument, getTestFixturePath } from './test-helpers';

suite('RfcDoc Format Extension Tests', function() {
  
  // 2. Document Structure Tests
  suite('2. Document Structure Tests', function() {
    
    // 2.1 Document outline/symbol provider
    test('2.1 Document outline/symbol provider', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = getTestFixturePath('outline-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get document symbols
      const symbols = await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      ) as vscode.DocumentSymbol[];
      
      // Verify symbols were returned
      assert.ok(symbols, 'Document symbols should be returned');
      assert.ok(symbols.length > 0, 'Document should have at least one symbol');
      
      // Get section names from symbols
      const sectionNames = symbols.map((symbol: vscode.DocumentSymbol) => symbol.name);
      
      isVerbose && console.log('Document symbols:', JSON.stringify(symbols, null, 2));
      isVerbose && console.log('Section names:', sectionNames);
      isVerbose && console.log('Note: Nested sections are not included in the symbols');
      
      // Verify that the document has the expected sections
      assert.ok(sectionNames.some((name: string) => name.includes('Test Document')), 'Document should have a title section');
      assert.ok(sectionNames.some((name: string) => name.includes('Numbered Section')), 'Document should have a numbered section');
    });
    
    // 2.2 Section detection - uppercase sections
    test('2.2 Section detection - uppercase sections', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = getTestFixturePath('outline-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get document symbols
      const symbols = await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      ) as vscode.DocumentSymbol[];
      
      // Verify symbols were returned
      assert.ok(symbols, 'Document symbols should be returned');
      
      // Find uppercase section
      const uppercaseSection = symbols.find(symbol => 
        symbol.name === 'UPPERCASE SECTION'
      );
      
      // Verify uppercase section was found
      assert.ok(uppercaseSection, 'Document should have an uppercase section');
      
      isVerbose && console.log('Uppercase section detected:', uppercaseSection);
    });
    
    // 2.3 Section detection - numbered sections
    test('2.3 Section detection - numbered sections', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = getTestFixturePath('outline-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get document symbols
      const symbols = await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      ) as vscode.DocumentSymbol[];
      
      // Verify symbols were returned
      assert.ok(symbols, 'Document symbols should be returned');
      
      // Find numbered sections
      const numberedSection1 = symbols.find(symbol => 
        symbol.name === '1. Numbered Section'
      );
      
      const numberedSection2 = symbols.find(symbol => 
        symbol.name === '2. Another Numbered Section'
      );
      
      // Verify numbered sections were found
      assert.ok(numberedSection1, 'Document should have a numbered section 1');
      assert.ok(numberedSection2, 'Document should have a numbered section 2');
      
      isVerbose && console.log('Numbered sections detected:', {
        numberedSection1,
        numberedSection2
      });
    });
    
    // 2.4 Section detection - alternative sections
    test('2.4 Section detection - alternative sections', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = getTestFixturePath('outline-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get document symbols
      const symbols = await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      ) as vscode.DocumentSymbol[];
      
      // Verify symbols were returned
      assert.ok(symbols, 'Document symbols should be returned');
      
      // Find alternative section
      const alternativeSection = symbols.find(symbol => 
        symbol.name === 'Alternative Section'
      );
      
      // Verify alternative section was found
      assert.ok(alternativeSection, 'Document should have an alternative section');
      
      isVerbose && console.log('Alternative section detected:', alternativeSection);
    });
    
    // 2.5 Folding markers
    test('2.5 Folding markers', async function() {
      this.timeout(10000); // Increase timeout for this test
      
      // Open the test document
      const testFilePath = getTestFixturePath('outline-test.rfc');
      const document = await openDocument(testFilePath);
      
      // Wait for the language mode to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get folding ranges
      const foldingRanges = await vscode.commands.executeCommand(
        'vscode.executeFoldingRangeProvider',
        document.uri
      ) as vscode.FoldingRange[];
      
      // Verify folding ranges were returned
      assert.ok(foldingRanges, 'Folding ranges should be returned');
      assert.ok(foldingRanges.length > 0, 'Document should have at least one folding range');
      
      isVerbose && console.log('Folding ranges:', JSON.stringify(foldingRanges, null, 2));
      
      // Based on the actual folding ranges returned, we can see that:
      // - The title section doesn't have a folding range
      // - Each section has its own folding range
      // - The nested code block has its own folding range
      
      // Find folding range for the first numbered section (lines 5-13)
      const numberedSectionFoldingRange = foldingRanges.find(range => 
        range.start === 5 && range.end >= 13
      );
      assert.ok(numberedSectionFoldingRange, 'Numbered section should have a folding range');
      
      // Find folding range for the nested code block (lines 9-13)
      const codeBlockFoldingRange = foldingRanges.find(range => 
        range.start === 9 && range.end >= 13
      );
      assert.ok(codeBlockFoldingRange, 'Code block should have a folding range');
      
      // Find folding range for another numbered section (lines 14-17)
      const anotherNumberedSectionFoldingRange = foldingRanges.find(range => 
        range.start === 14 && range.end >= 17
      );
      assert.ok(anotherNumberedSectionFoldingRange, 'Another numbered section should have a folding range');
      
      // Find folding range for alternative section (lines 18-21)
      const alternativeSectionFoldingRange = foldingRanges.find(range => 
        range.start === 18 && range.end >= 21
      );
      assert.ok(alternativeSectionFoldingRange, 'Alternative section should have a folding range');
      
      // Find folding range for uppercase section (lines 22-24)
      const uppercaseSectionFoldingRange = foldingRanges.find(range => 
        range.start === 22 && range.end >= 24
      );
      assert.ok(uppercaseSectionFoldingRange, 'Uppercase section should have a folding range');
    });
    
  });

});