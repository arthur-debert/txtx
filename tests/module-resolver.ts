/**
 * Module resolver for tests
 * This file redirects imports from src to dist
 */
import * as path from 'path';
import * as Module from 'module';

// Save the original require
const originalRequire = (Module as any).prototype.require;

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');

// Override the require function
(Module as any).prototype.require = function(id: string) {
  // If the module path contains /src/, redirect to /dist/src/
  if (id.includes('/src/')) {
    const newId = id.replace('/src/', '/dist/src/');
    return originalRequire.call(this, newId);
  }
  
  // Otherwise, use the original require
  return originalRequire.call(this, id);
};