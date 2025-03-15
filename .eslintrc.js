module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true,
    mocha: true,
    es6: true
  },
  globals: {
    // Test globals
    suite: true,
    test: true,
    setup: true,
    teardown: true
  },
  rules: {
    // Keep strict rules but with appropriate severity
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
  ignorePatterns: ['dist/**', 'node_modules/**']
}; 