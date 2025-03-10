const vscode = require('vscode');
const path = require('path');

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

/**
 * Helper function to open a document
 * @param {string} filePath - The path to the file to open
 * @returns {Promise<vscode.TextDocument>} - The opened document
 */
async function openDocument(filePath) {
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  return document;
}

/**
 * Get document sections using the document symbol provider
 * @param {vscode.TextDocument} document - The document to get sections for
 * @returns {Promise<Array<{name: string, level: number, range: vscode.Range}>>} - The sections
 */
async function getDocumentSections(document) {
  // Get document symbols
  const symbols = await vscode.commands.executeCommand(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  );
  
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  // Process symbols to extract section information
  const sections = [];
  
  for (const symbol of symbols) {
    // Determine section level
    let level = 1;
    let prefix = '';
    
    // Check if it's a numbered section
    const numberedMatch = symbol.name.match(/^(\d+(?:\.\d+)*)\. (.+)$/);
    if (numberedMatch) {
      const sectionNumber = numberedMatch[1];
      level = sectionNumber.split('.').length;
      prefix = sectionNumber + '.';
    } else if (symbol.name.match(/^: /)) {
      // Alternative section
      prefix = ':';
    }
    
    sections.push({
      name: symbol.name,
      level,
      range: symbol.range,
      prefix
    });
  }
  
  // Sort sections by line number
  sections.sort((a, b) => a.range.start.line - b.range.start.line);
  
  return sections;
}

module.exports = {
  isVerbose,
  openDocument,
  getDocumentSections
};