# Split Tests / Code

This code base is a vscode extension.

Hence, it requires integration tests to be run in vscode, increasing
assertiveness of functionality. Integration tests however are harder to write,
and more expensive to run. For that reason, it's a best practice to isolate
business logic from the vscode api, and test it in isolation.

Up to now, the code base didn't do that, and that's what we'll be working on.

## Phases I

Scan and document all tests. We want to know file and test name, what it tests,
and how dependent is it on vscode api. It's worthwile to be specific about the
dependency. For example, a command that runs on a file, can be tested by unit
tests on a string, with a simple integration test to verify the command exists
and is called. In general we want to know if the vscode dependency is
non-existant, minimal, or heavy. Heavy tend to be , in this case, things that
work on the vscode parser for this file type.

Produce a table with "File", "Test", "Description", "Dependency" columns. For
now all tests are in /tests/integration/ , and the source code in /src/extension

**Deliverable**: the analisys table, see table bellow

## Phase II

Split commands from vscode api, in the src code. Pure logic code should be in
src/core. For commands: src/core/commands/`<command-name>`.js

Then add unit tests for that command under
/tests/unit/core/commands/`<command-name>`.test.js

Do these , one at at time:

- Split code
- write tests
- verify tests Phases
- verify tests have no vscode dependency
- verify test cover mostly the business logic of the integration tests we're
  replacing.
- if all is good, remove the integration tests and any dead code.

For now , let's do all commands that have minimal dependency.
Fell free to add base code to ./src/extension/vscode.lib.js that will improve the code structure. 

## Resources

### Analysys table

| File | Test | Description | Dependency |
|------|------|-------------|------------|
| 1-basic-extension.test.js | 1.1 Extension loads | Verifies the extension is loaded | Minimal - Only checks if extension is loaded |
| 1-basic-extension.test.js | 1.2 Extension is active in .rfc files | Verifies the extension is active for .rfc files | Minimal - Opens a document and checks language ID |
| 1-basic-extension.test.js | 1.3 Extension exports | Verifies the extension provides expected functionality | Minimal - Opens a document and checks language ID |
| 2-document-structure.test.js | 2.1 Document outline/symbol provider | Tests the document symbol provider | Heavy - Uses VSCode document symbol provider API |
| 2-document-structure.test.js | 2.2 Section detection - uppercase sections | Tests detection of uppercase sections | Heavy - Uses VSCode document symbol provider API |
| 2-document-structure.test.js | 2.3 Section detection - numbered sections | Tests detection of numbered sections | Heavy - Uses VSCode document symbol provider API |
| 2-document-structure.test.js | 2.4 Section detection - alternative sections | Tests detection of alternative sections | Heavy - Uses VSCode document symbol provider API |
| 2-document-structure.test.js | 2.5 Folding markers | Tests folding range provider | Heavy - Uses VSCode folding range provider API |
| 3-syntax-highlighting.test.js | 3.1 Text formatting - bold | Tests bold text formatting | Minimal - Opens document and checks text content |
| 3-syntax-highlighting.test.js | 3.2 Text formatting - italic | Tests italic text formatting | Minimal - Opens document and checks text content |
| 3-syntax-highlighting.test.js | 3.3 Section types highlighting | Tests section type highlighting | Minimal - Opens document and checks text content |
| 3-syntax-highlighting.test.js | 3.4 Lists - bullet points | Tests bullet point list formatting | Minimal - Opens document and checks text content |
| 4-feature-tests.test.js | 4.1 Transformations - right arrow | Tests right arrow transformation | Heavy - Manipulates editor and selection |
| 4-feature-tests.test.js | 4.2 Transformations - left arrow | Tests left arrow transformation | Heavy - Manipulates editor and selection |
| 4-feature-tests.test.js | 4.5 Insertion features - basic insertions | Tests emoticon insertion | Heavy - Manipulates editor and selection |
| 4-feature-tests.test.js | 4.9 Footnotes - references | Tests footnote references | Heavy - Uses VSCode link provider API |
| 5-command-tests.test.js | 5.1 Format document command | Tests the format document command | Heavy - Uses editor, executes command, verifies formatting |
| 5-command-tests.test.js | 5.7 Fix Numbering command (skipped) | Tests the fix numbering command | Heavy - Uses editor, executes command, verifies numbering |
| simple.test.js | VSCode should be available | Verifies VSCode is available | Minimal - Just checks if VSCode is defined |
| simple.test.js | VSCode version should be defined | Verifies VSCode version is defined | Minimal - Just checks if VSCode version is defined |
| simple.test.js | Extension should be activated | Verifies extension can be activated | Minimal - Gets extension and activates it |
| simple.test.js | Commands should be registered | Verifies commands are registered | Minimal - Checks if commands exist |
