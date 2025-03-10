const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const yaml = require('js-yaml');

/**
 * Load YAML file and parse its contents
 * @param {string} filePath - Path to the YAML file
 * @param {vscode.OutputChannel} outputChannel - Output channel for logging
 * @returns {Array|Object} - Parsed YAML content
 */
function loadYamlFile(filePath, outputChannel) {
    try {
        // Resolve the file path relative to the extension directory
        const extensionPath = vscode.extensions.getExtension('txtdoc-format').extensionPath;
        const fullPath = path.resolve(extensionPath, filePath);
        
        // Read and parse the YAML file
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const parsedContent = yaml.load(fileContent);
        
        outputChannel.appendLine(`Loaded YAML file: ${filePath}`);
        return parsedContent;
    } catch (error) {
        outputChannel.appendLine(`Error loading YAML file ${filePath}: ${error.message}`);
        // Return empty array as fallback
        return [];
    }
}

module.exports = {
    loadYamlFile
};