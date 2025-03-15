#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.dist/**', 'coverage/**', 'fix-imports.js']
});

const importRegex = /from\s+['"]([^'"]+)['"]/g;

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let modified = false;

  // Replace imports
  content = content.replace(importRegex, (match, importPath) => {
    // Only add .js to relative imports that don't already have an extension
    if ((importPath.startsWith('./') || importPath.startsWith('../')) && !path.extname(importPath)) {
      modified = true;
      return `from '${importPath}.js'`;
    }
    return match;
  });

  // Write back if modified
  if (modified) {
    writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
}); 