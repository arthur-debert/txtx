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

module.exports = {
  isVerbose,
  openDocument
};