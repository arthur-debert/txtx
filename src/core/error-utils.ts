/**
 * Error Utilities
 * This file provides utilities for consistent error handling across the codebase
 */

/**
 * Error codes for standardized error handling
 */
export enum ErrorCode {
  FILE_TYPE_UNSUPPORTED = 'file_type_unsupported',
  PROCESSING_ERROR = 'processing_error',
  VALIDATION_ERROR = 'validation_error',
  NOT_IMPLEMENTED = 'not_implemented',
  INVALID_ARGUMENT = 'invalid_argument',
  NO_ACTIVE_EDITOR = 'no_active_editor',
  NO_SECTIONS_FOUND = 'no_sections_found',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Standard error information structure
 */
export interface ErrorInfo {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

/**
 * Standard command result interface
 */
export interface CommandResult<T> {
  success: boolean;
  result?: T;
  error?: ErrorInfo;
}

/**
 * Create a standardized error object
 * @param code - The error code
 * @param message - The error message
 * @param details - Optional additional details
 * @returns - A standardized error object
 */
export function createError(code: ErrorCode, message: string, details?: unknown): ErrorInfo {
  return { code, message, details };
}

/**
 * Type guard to check if a value is a CommandResult
 * @param value - The value to check
 * @returns - Whether the value is a CommandResult
 */
export function isCommandResult<T>(value: unknown): value is CommandResult<T> {
  return Boolean(value) && typeof value === 'object' && value !== null && 'success' in value;
}

/**
 * Type guard to check if a value is an ErrorInfo
 * @param value - The value to check
 * @returns - Whether the value is an ErrorInfo
 */
export function isErrorInfo(value: unknown): value is ErrorInfo {
  return Boolean(value) && typeof value === 'object' && value !== null && 'code' in value && 'message' in value;
}

/**
 * Get a human-readable error message from an error object
 * @param error - The error object
 * @param defaultMessage - The default message to use if the error doesn't have a message
 * @returns - A human-readable error message
 */
export function getErrorMessage(error: unknown, defaultMessage: string = 'An unknown error occurred'): string {
  if (isErrorInfo(error)) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return defaultMessage;
  }
}

/**
 * Create a success result
 * @param result - The result value
 * @returns - A success result
 */
export function createSuccess<T>(result: T): CommandResult<T> {
  return { success: true, result };
}

/**
 * Create a failure result
 * @param code - The error code
 * @param message - The error message
 * @param details - Optional additional details
 * @returns - A failure result
 */
export function createFailure<T>(code: ErrorCode, message: string, details?: unknown): CommandResult<T> {
  return { 
    success: false, 
    error: createError(code, message, details) 
  };
}