# RfcDoc Format

A Visual Studio Code extension that provides syntax highlighting for plain text
files following old-school Unix guidelines.

## Features

This extension provides syntax highlighting for the following elements in RfcDoc
files:

- **Document Outline**: Automatic outline view for sections and code blocks
- **Arrow Transformations**: Automatically transforms arrow notations to Unicode
  arrows
- **Theming**
- **Path Completion**: Automatic completion for file and folder paths

## Document Outline

The extension provides document outline support for RfcDoc files:

1. Open a RfcDoc file (`.txt`, `.txtx`, or `.rfc`)
2. Open the Outline view in the Explorer sidebar
3. The outline will show:
   - Sections (starting with a capital letter)
   - Code blocks (indented with 4 spaces)

The outline is hierarchical, with code blocks nested under their parent sections
when applicable.

## Themes

This extension includes two custom themes specifically designed for RfcDoc
files:

- **RfcDoc Dark**: A dark theme optimized for RfcDoc syntax
- **RfcDoc Light**: A light theme optimized for RfcDoc syntax

For information on how to customize these themes or create your own, see the
[VSCode Theme Customization Primer](docs/vscode-theme-primer.md).

To activate a theme:

1. Press `Ctrl+K Ctrl+T` or go to File > Preferences > Color Theme
2. Select either "RfcDoc Dark" or "RfcDoc Light" from the list

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions view
3. Search for "RfcDoc Format"
4. Click Install

## Defs

- **Titles**: Underlined with dashes

  ```text
  This is a title
  ---------------
  ```

- **Sections**: Starting with a capital letter

  ```text
  A Section
  ```

- **Lists**:

  - Bullet points with "-"

  ```text
  - Item 1
  - Item 2
  ```

  - Numbered lists with numbers, letters, and roman numerals

  ```text
  1. Top level
      a. Second level
      b. More nesting
          i. Third level
  ```

- **Code Blocks**: Indented with 4 spaces

  ```text
      int main(void) {
          printf("Hello, world!\n");
          return 0;
      }
  ```

- **Quotes**: Using ">" and ">>" for nesting

  ```text
  > This is a quoted line.
  >> This is a nested quoted line.
  ```

- **Emphasis/Italics**: Using "\_" around text

  ````text
  _This text will be italic_
  |   ```
  |
  | - **Bold**: Using "\*" around text
  |
  |   ```text
  |   *This text will be bold*
  ````

- **Arrow Transformations**: Automatically transforms arrow notations to Unicode
  arrows

  ```text
  -> transforms to → (right arrow)
  <- transforms to ← (left arrow)
  ^- transforms to ↑ (up arrow)
  v- transforms to ↓ (down arrow)
  ```

- **Text Emoticons**: Type `:keyword` to search and insert emoticons

  ```text
  :smile -> 🙂 (Smiley, happy face)
  :laugh -> 😄 (Laughing, big grin)
  :cry -> 😢 (Crying)
  :shrug -> ¯\_(ツ)_/¯ (Shrugs)
  ```

- **Path Completion**: Automatic completion for file and folder paths

  ```text
  ./ -> Shows files and folders in the current directory
  ../ -> Shows files and folders in the parent directory
  / -> Shows files and folders from the workspace root
  ```

## Document Outline

The extension provides document outline support for RfcDoc files:

1. Open a RfcDoc file (`.txt`, `.txtx`, or `.rfc`)
2. Open the Outline view in the Explorer sidebar
3. The outline will show:
   - Sections (starting with a capital letter)
   - Code blocks (indented with 4 spaces)

The outline is hierarchical, with code blocks nested under their parent sections
when applicable.

## Themes

This extension includes two custom themes specifically designed for RfcDoc
files:

- **RfcDoc Dark**: A dark theme optimized for RfcDoc syntax
- **RfcDoc Light**: A light theme optimized for RfcDoc syntax

For information on how to customize these themes or create your own, see the
[VSCode Theme Customization Primer](docs/vscode-theme-primer.md).

To activate a theme:

1. Press `Ctrl+K Ctrl+T` or go to File > Preferences > Color Theme
2. Select either "RfcDoc Dark" or "RfcDoc Light" from the list

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions view
3. Search for "RfcDoc Format"
4. Click Install

## Usage

The extension automatically activates for all `.txt`, `.txtx`, and `.rfc` files.
If you want to manually set a file to use RfcDoc highlighting:

1. Open the file
2. Click on the language mode indicator in the bottom-right corner of VS Code
3. Select "RfcDoc" from the list

## Testing the Extension

To test the extension:

1. Open the Run and Debug view in VSCode (Ctrl+Shift+D or Cmd+Shift+D on Mac)
2. From the dropdown menu at the top, select "Extension (with sample)"
3. Click the green play button or press F5 to launch a new window with the
   extension loaded
4. The test-dir directory will open in the new window
5. Open the sample.txt, sample.txtx, and sample.rfc files in the test-dir
   directory
6. Check the "txtos" output channel in the Output panel to see debug logs
7. Verify that both files use the RfcDoc highlighting

To test with only specific extensions enabled:

1. Open the Run and Debug view in VSCode (Ctrl+Shift+D or Cmd+Shift+D on Mac)
2. From the dropdown menu at the top, select "Extension (with required
   extensions only)"
3. Click the green play button or press F5 to launch a new window
4. The test-dir directory will open in the new window
5. Only the RfcDoc Format, Markdown, and Prettier extensions will be enabled
6. Open the sample.txt, sample.txtx, or sample.rfc file to test the highlighting

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Known Issues

- None at this time

## Release Notes

### 0.1.0

- Initial release
- Basic syntax highlighting for RfcDoc format
- Custom dark and light themes

### 0.2.0

- Added document outline support for sections and code blocks
- Improved folding markers for better code organization
- Enhanced syntax highlighting with meta scopes

### 0.3.0

- Added arrow transformation feature
- Automatically converts arrow notations to Unicode arrows
- Supports right (->), left (<-), up (^-), and down (v-) arrows

### 0.4.0

- Added text emoticon feature
- Type `:keyword` to search for emoticons by name
- Supports a wide range of emoticons and emoji

### 0.5.0

- Added file and folder path completion
- Improved emoticon replacement functionality
- Disabled default symbol completion to focus on emoticons and paths
- Fixed issues with emoticon selection and replacement
