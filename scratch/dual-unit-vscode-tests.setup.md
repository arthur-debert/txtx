# Test Setup Guide

This guide explains how to set up the testing environment for the project, including unit and integration tests.

## 1. Directory Structure

The test-related files and directories are organized as follows:

```text
/Users/adebert/h/padz/
├── .mocharc.json  (Mocha configuration file)
├── package.json   (NPM package file with test scripts)
└── tests/
    ├── runTest.ts  (Main test runner script)
    ├── testExtension.ts (VS Code extension entry point for testing)
    ├── testController.ts (VS Code Test Controller integration)
    ├── testSetup.ts (Test environment setup)
    ├── integration/
    │   └── index.ts  (Integration test setup)
    └── unit/
        ├── index.ts  (Unit test setup)
        └── testHelpers.ts (Helper functions for unit tests, loaded by .mocharc.json)

```

## 2. `package.json` Scripts

The `package.json` file defines the following scripts related to testing:

```json
{
  "scripts": {
    "test": "node ./dist/tests/runTest.js",
    "test:unit": "node ./dist/tests/runTest.js unit --reporter=mocha-junit-reporter --reporter-options mochaFile=./test-results/unit/results.xml",
    "test:integration": "node ./dist/tests/runTest.js integration --reporter=mocha-junit-reporter --reporter-options mochaFile=./test-results/integration/results.xml",
    "pretest:unit": "npm run compile",
    "pretest:integration": "npm run compile"
  }
}
```

- **`npm test`**: Runs all tests (both unit and integration) by executing `/Users/adebert/h/padz/tests/runTest.js`.
- **`npm run test:unit`**: Runs only the unit tests. It executes `/Users/adebert/h/padz/tests/runTest.js` with the `unit` argument. It uses `mocha-junit-reporter` to generate an XML report at `/Users/adebert/h/padz/test-results/unit/results.xml`.
- **`npm run test:integration`**: Runs only the integration tests. It executes `/Users/adebert/h/padz/tests/runTest.js` with the `integration` argument. It uses `mocha-junit-reporter` to generate an XML report at `/Users/adebert/h/padz/test-results/integration/results.xml`.
- **`pretest:unit`**: Runs before `test:unit`, compiling the code.
- **`pretest:integration`**: Runs before `test:integration`, compiling the code.

## 3. `.mocharc.json` Configuration

The `.mocharc.json` file (/Users/adebert/h/padz/.mocharc.json) configures Mocha:

```json
{
  "ui": "tdd",
  "color": true,
  "require": "ts-node/register",
  "timeout": 10000,
  "file": "./tests/unit/testHelpers.ts",
  "node-option": ["experimental-specifier-resolution=node", "no-warnings"],
  "recursive": true,
  "exit": true,
  "cwd": "."
}
```

- **`ui`**: Uses the TDD (Test-Driven Development) interface.
- **`color`**: Enables colored output.
- **`require`**: Uses `ts-node/register` to run TypeScript tests directly.
- **`timeout`**: Sets the test timeout to 10 seconds (10000 ms).
- **`file`**: Loads `/Users/adebert/h/padz/tests/unit/testHelpers.ts` before unit tests. This file sets up the testing environment.
- **`node-option`**: Sets Node.js options for experimental features and suppressing warnings.
- **`recursive`**: Tells mocha to look for tests in subdirectories.
- **`exit`**: Forces Mocha to exit after tests complete.
- **`cwd`**: Sets the current working directory.

## 4. Core Test Files

- **`/Users/adebert/h/padz/tests/runTest.ts`**: This is the main script that orchestrates test execution. It takes an optional argument (`unit` or `integration`) to run specific test suites. If no argument is provided, it runs both. It uses `@vscode/test-electron` to run integration tests within a VS Code instance.

- **`/Users/adebert/h/padz/tests/testExtension.ts`**: A separate VS Code extension entry point for testing. It activates the test controller (if enabled in settings) and adds a status bar item.

- **`/Users/adebert/h/padz/tests/integration/index.ts`**: Sets up and runs integration tests using Mocha. It finds test files (`.test.js`) within the `tests/integration` directory.

- **`/Users/adebert/h/padz/tests/unit/index.ts`**: Sets up and runs unit tests using Mocha. It finds test files (`.test.js`) within the `tests/unit` directory and allows configuring the reporter via environment variables.

- **`/Users/adebert/h/padz/tests/testController.ts`**: Implements a `MochaTestController` class that integrates with VS Code's Test Explorer UI. It discovers unit tests and provides handlers for running and debugging them.

- **`/Users/adebert/h/padz/tests/testSetup.ts`**: Manages the activation and deactivation of the `MochaTestController`, controlled by the `padz.enableTestController` setting.

- **`/Users/adebert/h/padz/tests/unit/testHelpers.ts`**: Provides helper functions and sets up the environment for unit tests. It creates a temporary test directory and sets global variables.

## 5. VS Code Test Explorer Integration (Optional)

The `testExtension.ts`, `testController.ts` and `testSetup.ts` files, along with the `padz.enableTestController` setting in `package.json`, enable integration with the VS Code Test Explorer UI. This provides a visual interface for running and debugging tests within VS Code. If `padz.enableTestController` is set to `true`, the Test Explorer will be activated.

This setup provides a comprehensive testing environment with separate unit and integration test suites, reporting, and optional VS Code Test Explorer integration.
