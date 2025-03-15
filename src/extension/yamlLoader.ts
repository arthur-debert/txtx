import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

type YamlContent = string[][];

/**
 * Load YAML file and parse its contents
 * @param filePath - Path to the YAML file
 * @param outputChannel - Output channel for logging
 * @returns - Parsed YAML content
 */
function loadYamlFile(
  filePath: string,
  outputChannel: vscode.OutputChannel
): YamlContent {
  try {
    // Resolve the file path relative to the extension directory
    const extensionPath = vscode.extensions.getExtension('txxt-format')?.extensionPath;
    if (!extensionPath) {
      throw new Error('Extension path not found');
    }

    const fullPath = path.resolve(extensionPath, filePath);

    // Read and parse the YAML file
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const parsedContent = yaml.load(fileContent);

    outputChannel.appendLine(`Loaded YAML file: ${filePath}`);
    return parsedContent as YamlContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(`Error loading YAML file ${filePath}: ${errorMessage}`);
    // Return empty array as fallback
    return [];
  }
}

export { loadYamlFile, YamlContent };
