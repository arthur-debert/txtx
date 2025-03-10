# VSCode Theme Customization Primer

This document provides guidance on how to customize the TxtDoc themes or create your own themes for the TxtDoc extension.

## Theme Structure

VSCode themes are defined in JSON files with two main sections:

1. **colors**: Defines workbench colors (editor background, foreground, etc.)
2. **tokenColors**: Defines syntax highlighting colors for specific scopes

## What Can Be Customized

### Text Styling

- **Font Family**: You cannot change the font family through themes. Font family is a global VSCode setting (`editor.fontFamily`).
- **Font Size**: You cannot change the font size through themes. Font size is a global VSCode setting (`editor.fontSize`).
- **Font Weight**: You can set `fontStyle` to "bold" for specific scopes.
- **Font Style**: You can set `fontStyle` to "italic" or "underline" for specific scopes.
- **Text Color**: You can set `foreground` color for specific scopes.

### Background and Borders

- **Background Color**: You can set `background` color for specific scopes or the entire editor.
- **Borders**: You cannot directly add borders to text through themes. However, you can use:
  - The `editor.rulers` setting to add vertical rulers
  - The `editor.lineHighlightBorder` color to add borders to the current line

### Block Quote Styling

Block quotes can be styled using several VSCode theme colors:

- **textBlockQuote.background**: Background color for block quotes.
- **textBlockQuote.border**: Border color for block quotes. This adds a vertical line at the left of the block quote.
- **textCodeBlock.background**: Background color for code blocks in text.

### Other Customizations

- **Line Height**: You cannot change line height through themes. Line height is a global VSCode setting (`editor.lineHeight`).
- **Letter Spacing**: You cannot change letter spacing through themes.
- **Text Decorations**: You can use `fontStyle` for basic decorations like underline.

## How to Customize the TxtDoc Themes

### Method 1: Modify the Theme Files Directly

1. Open the theme file you want to modify:
   - `themes/txtdoc-dark-theme.json` for the dark theme
   - `themes/txtdoc-light-theme.json` for the light theme

2. Modify the color values or add new token scopes as needed.

3. Reload the window to see your changes.

### Method 2: Create a Custom Theme

1. Create a new JSON file in the `themes` directory (e.g., `themes/txtdoc-custom-theme.json`).

2. Copy the content from one of the existing themes as a starting point.

3. Modify the colors and settings as desired.

4. Add your theme to the `contributes.themes` section in `package.json`:

```json
"themes": [
  {
    "label": "TxtDoc Custom",
    "uiTheme": "vs-dark", // or "vs" for light themes
    "path": "./themes/txtdoc-custom-theme.json"
  }
]
```

## TxtDoc-Specific Scopes

The TxtDoc extension defines the following scopes that you can target in your theme:

- `markup.heading.txtdoc`: Titles underlined with dashes
- `entity.name.section.txtdoc`: Section headings
- `markup.list.unnumbered.txtdoc`: Bullet point lists
- `markup.list.numbered.txtdoc`: Numbered lists
- `markup.list.lettered.txtdoc`: Lettered lists
- `markup.list.roman.txtdoc`: Roman numeral lists
- `markup.list.number.txtdoc`: The number in numbered lists
- `markup.list.letter.txtdoc`: The letter in lettered lists
- `markup.list.roman.txtdoc`: The roman numeral in roman numeral lists
- `markup.list.item.txtdoc`: The content of list items
- `markup.raw.block.txtdoc`: Code blocks
- `markup.quote.content.txtdoc`: Quoted text
- `markup.quote.nested.content.txtdoc`: Nested quoted text
- `markup.italic.txtdoc`: Emphasized text (with _underscores_)

## Example: Customizing the Dark Theme

Here's an example of how to modify the dark theme to use a different color for headings and add a background to code blocks:

```json
{
  "name": "TxtDoc Dark Custom",
  "type": "dark",
  "colors": {
    "editor.background": "#1E1E1E",
    "editor.foreground": "#D4D4D4",
    "textBlockQuote.border": "#569CD6",
    "textBlockQuote.background": "#1E1E1E50"
  },
  "tokenColors": [
    {
      "scope": "markup.heading.txtdoc",
      "settings": {
        "foreground": "#FF8800", // Changed from blue to orange
        "fontStyle": "bold"
      }
    },
    {
      "scope": "markup.raw.block.txtdoc",
      "settings": {
        "foreground": "#DCDCAA",
        "background": "#2A2A2A" // Added darker background for code blocks
      }
    }
  ]
}
```

## VSCode Settings for Better Text Editing

While themes can't control everything, you can enhance your text editing experience with these VSCode settings:

```json
{
  // Font and text settings
  "editor.fontFamily": "Consolas, 'Courier New', monospace",
  "editor.fontSize": 14,
  "editor.lineHeight": 1.5,
  
  // Layout settings
  "editor.rulers": [80],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 80,
  
  // Block quote styling
  "workbench.colorCustomizations": {
    "textBlockQuote.border": "#5a9dd5",
    "textBlockQuote.background": "#1c3f5e20",
    "textCodeBlock.background": "#0a0a0a20"
  }
}
```

## Resources

- [VSCode Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)
- [VSCode TextMate Grammar Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [TextMate Scope Naming Conventions](https://macromates.com/manual/en/language_grammars#naming-conventions)