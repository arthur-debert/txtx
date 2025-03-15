import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        process: true,
        __dirname: true,
        setTimeout: true,
        console: true,
        module: true,
        require: true,
        // Test globals
        suite: true,
        test: true,
        setup: true,
        teardown: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-expressions': ['error', {
        'allowShortCircuit': true,
        'allowTernary': true
      }],
      'no-undef': 'error',
      'no-prototype-builtins': 'error',
      'no-useless-escape': 'error'
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]; 