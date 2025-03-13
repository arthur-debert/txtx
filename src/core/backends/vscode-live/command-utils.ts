/**
 * Command Utilities - VSCode Live Backend
 * 
 * This module provides utility functions for executing commands in the VSCode Live backend
 */

import * as vscode from 'vscode';
import { CommandResult, isCommandResult, getErrorMessage, ErrorCode, createError } from '../../error-utils';

/**
 * Execute a headless command and handle the result
 * @param command - The headless command to execute
 * @param document - The VSCode document to process
 * @param text - The document text
 * @param filePath - The document file path
 * @param errorPrefix - The prefix for error messages
 * @returns - The result of the command execution
 */
export async function executeHeadlessCommand<T>(
  command: (text: string, filePath: string) => Promise<CommandResult<T>>,
  document: vscode.TextDocument,
  text: string,
  filePath: string,
  errorPrefix: string
): Promise<CommandResult<T>> {
  try {
    // Execute the command
    const result = await command(text, filePath);
    
    // Validate the result
    if (!isCommandResult(result)) {
      return {
        success: false,
        error: createError(ErrorCode.UNKNOWN_ERROR, `Invalid result from ${errorPrefix}`)
      };
    }
    
    return result;
  } catch (error) {
    // Handle any errors
    return {
      success: false,
      error: createError(ErrorCode.PROCESSING_ERROR, `${errorPrefix}: ${getErrorMessage(error, 'Unknown error')}`)
    };
  }
}

/**
 * Show an error message for a command result
 * @param result - The command result
 * @param defaultMessage - The default error message
 * @returns - Whether the result was successful
 */
export function handleCommandError<T>(
  result: CommandResult<T>,
  defaultMessage: string
): boolean {
  if (!result.success) {
    vscode.window.showErrorMessage(getErrorMessage(result.error, defaultMessage));
    return false;
  }
  return true;
}

/**
 * Validate that a result is of the expected type
 * @param result - The command result
 * @param typeValidator - A function to validate the type of the result
 * @param errorMessage - The error message to show if the type is invalid
 * @returns - Whether the result is of the expected type
 */
export function validateResultType<T>(
  result: CommandResult<T>,
  typeValidator: (value: any) => boolean,
  errorMessage: string
): boolean {
  if (!result.result || !typeValidator(result.result)) {
    vscode.window.showErrorMessage(errorMessage);
    return false;
  }
  return true;
}

/**
 * Get the full range of a document
 * @param document - The document to get the range for
 * @returns - The full range of the document
 */
export function getDocumentFullRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
  );
}