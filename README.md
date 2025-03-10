# TxtDoc Format

A Visual Studio Code extension that provides syntax highlighting for TxtDoc
format, a plain text documentation format following old-school Unix guidelines.

## Features

This extension provides syntax highlighting for the following elements in TxtDoc
files:

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

- **Emphasis**: Using "\_" around text

  ```text
  _Note_
  ```

## Themes

This extension includes two custom themes specifically designed for TxtDoc
files:

- **TxtDoc Dark**: A dark theme optimized for TxtDoc syntax
- **TxtDoc Light**: A light theme optimized for TxtDoc syntax

To activate a theme:

1. Press `Ctrl+K Ctrl+T` or go to File > Preferences > Color Theme
2. Select either "TxtDoc Dark" or "TxtDoc Light" from the list

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions view
3. Search for "TxtDoc Format"
4. Click Install

## Usage

The extension automatically activates for all `.txt` and `.txtx` files. If you want to
manually set a file to use TxtDoc highlighting:

1. Open the file
2. Click on the language mode indicator in the bottom-right corner of VS Code
3. Select "TxtDoc" from the list

## Testing the Extension

To test the extension:

1. Open the Run and Debug view in VSCode (Ctrl+Shift+D or Cmd+Shift+D on Mac)
2. From the dropdown menu at the top, select "Extension (with sample)"
3. Click the green play button or press F5 to launch a new window with the extension loaded
4. The test-dir directory will open in the new window
5. Open the sample.txt and sample.txtx files in the test-dir directory
6. Check the "txtos" output channel in the Output panel to see debug logs
7. Verify that both files use the TxtDoc highlighting

To test with only specific extensions enabled:

1. Open the Run and Debug view in VSCode (Ctrl+Shift+D or Cmd+Shift+D on Mac)
2. From the dropdown menu at the top, select "Extension (with required extensions only)"
3. Click the green play button or press F5 to launch a new window
4. The test-dir directory will open in the new window
5. Only the TxtDoc Format, Markdown, and Prettier extensions will be enabled
6. Open the sample.txt or sample.txtx file to test the highlighting

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Known Issues

- None at this time

## Release Notes

### 0.1.0

- Initial release
- Basic syntax highlighting for TxtDoc format
- Custom dark and light themes
