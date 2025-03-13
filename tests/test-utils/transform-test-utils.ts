/**
 * Transform Test Utilities
 * 
 * This module provides utilities for testing text transformations by comparing
 * input and expected output files.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

/**
 * Options for the transform test
 */
export interface TransformTestOptions {
  /**
   * The directory containing the test files
   */
  testDir: string;
  
  /**
   * The base name of the test files (without extension)
   */
  testName: string;
  
  /**
   * The transformation function to test
   */
  transformFn: (input: string) => string | Promise<string>;
  
  /**
   * Whether to strip comments from the input and expected output
   * Default: true
   */
  stripComments?: boolean;
  
  /**
   * Whether to normalize line endings
   * Default: true
   */
  normalizeLineEndings?: boolean;
  
  /**
   * Whether to trim whitespace from the beginning and end of each line
   * Default: false
   */
  trimLines?: boolean;
}

/**
 * Run a transform test by comparing the transformed input with the expected output
 * @param options - The test options
 */
export async function runTransformTest(options: TransformTestOptions): Promise<void> {
  const {
    testDir,
    testName,
    transformFn,
    stripComments = true,
    normalizeLineEndings = true,
    trimLines = false
  } = options;
  
  // Construct the file paths
  const inputPath = path.join(testDir, `${testName}.rfc`);
  const expectedPath = path.join(testDir, `${testName}.txt`);
  
  // Read the input and expected output files
  const inputText = fs.readFileSync(inputPath, 'utf8');
  const expectedText = fs.readFileSync(expectedPath, 'utf8');
  
  // Process the input text
  const processedInput = processText(inputText, { stripComments, normalizeLineEndings, trimLines });
  
  // Transform the input
  const transformedText = await Promise.resolve(transformFn(inputText));
  
  // Process the transformed text
  const processedTransformed = processText(transformedText, { stripComments, normalizeLineEndings, trimLines });
  
  // Process the expected text
  const processedExpected = processText(expectedText, { stripComments, normalizeLineEndings, trimLines });
  
  // Compare the transformed text with the expected output
  assert.strictEqual(
    processedTransformed,
    processedExpected,
    `Transformed text does not match expected output for ${testName}`
  );
}

/**
 * Process text by stripping comments, normalizing line endings, and trimming lines
 * @param text - The text to process
 * @param options - The processing options
 * @returns - The processed text
 */
function processText(
  text: string,
  options: {
    stripComments: boolean;
    normalizeLineEndings: boolean;
    trimLines: boolean;
  }
): string {
  let processed = text;
  
  // Normalize line endings
  if (options.normalizeLineEndings) {
    processed = processed.replace(/\r\n/g, '\n');
  }
  
  // Split into lines
  let lines = processed.split('\n');
  
  // Strip comments
  if (options.stripComments) {
    lines = lines.filter(line => !line.trim().startsWith('#'));
  }
  
  // Trim lines
  if (options.trimLines) {
    lines = lines.map(line => line.trim());
  }
  
  // Join lines back together
  return lines.join('\n');
}

/**
 * Run multiple transform tests in a directory
 * @param baseDir - The base directory containing the test files
 * @param transformFn - The transformation function to test
 * @param options - Additional options for the tests
 */
export async function runTransformTestsInDirectory(
  baseDir: string,
  transformFn: (input: string) => string | Promise<string>,
  options: Omit<TransformTestOptions, 'testDir' | 'testName' | 'transformFn'> = {}
): Promise<void> {
  // Get all .rfc files in the directory
  const files = fs.readdirSync(baseDir)
    .filter(file => file.endsWith('.rfc'));
  
  // Run a test for each file
  for (const file of files) {
    const testName = path.basename(file, '.rfc');
    
    // Check if the corresponding .txt file exists
    const expectedPath = path.join(baseDir, `${testName}.txt`);
    if (!fs.existsSync(expectedPath)) {
      console.warn(`Warning: No expected output file found for ${testName}`);
      continue;
    }
    
    // Run the test
    await runTransformTest({
      testDir: baseDir,
      testName,
      transformFn,
      ...options
    });
  }
}