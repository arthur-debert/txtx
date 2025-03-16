/**
 * Script to copy the oniguruma WASM file to the dist directory
 * This helps with WASM loading issues in different environments
 */

import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// eslint-disable-next-line no-undef
const console = globalThis.console;
// eslint-disable-next-line no-undef
const process = globalThis.process;

try {
    // Find the WASM file
    const wasmPath = path.join(require.resolve('vscode-oniguruma'), '../onig.wasm');
    
    if (!fs.existsSync(wasmPath)) {
        console.error(`WASM file not found at ${wasmPath}`);
        process.exit(1);
    }
    
    // Create dist directory if it doesn't exist
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Copy the WASM file to dist
    const destPath = path.join(distDir, 'onig.wasm');
    fs.copyFileSync(wasmPath, destPath);
    
    console.log(`Successfully copied WASM file to ${destPath}`);
} catch (error) {
    console.error('Error copying WASM file:', error);
    process.exit(1);
} 