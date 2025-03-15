import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { sendNotification } from './notifications';
import { readFileSync } from 'fs';
import * as vscodeLib from './vscode.lib';
import { SECTION_REGEX, NUMBERED_SECTION_REGEX, ALTERNATIVE_SECTION_REGEX } from './constants';

/**
 * Export the document as HTML
 * @param document - The document to export
 * @returns - Whether the export was successful
 */
async function exportAsHtml(document: vscode.TextDocument): Promise<boolean> {
  // Only export RFC files
  if (document.languageId !== 'txxt' || !document.fileName.endsWith('.rfc')) {
    sendNotification('EXPORT_RFC_ONLY');
    return false;
  }

  const editor = vscodeLib.getActiveEditor();
  if (!editor) {
    sendNotification('EXPORT_NO_EDITOR');
    return false;
  }

  try {
    // Get the entire document text
    const text = document.getText();
    const lines = text.split('\n');
    const inputPath = document.fileName;
    const baseName = path.basename(inputPath, '.rfc');
    const outputDir = path.dirname(inputPath);
    const htmlOutputPath = path.join(outputDir, `${baseName}.html`);
    const cssOutputPath = path.join(outputDir, `${baseName}.css`);

    // Generate HTML and CSS content
    const { htmlContent, cssContent } = generateHtmlAndCss(lines, baseName);

    // Write the CSS content to a separate file
    fs.writeFileSync(cssOutputPath, cssContent, 'utf8');

    // Write the HTML content to the HTML file
    fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');

    sendNotification('EXPORT_SUCCESS', `${baseName}.html and ${baseName}.css`);
    return true;
  } catch (error) {
    sendNotification('EXPORT_ERROR', error);
    return false;
  }
}

/**
 * Generate HTML and CSS content from RFC document lines
 * @param lines - The document lines
 * @param baseName - The base name of the file (without extension)
 * @returns - Object containing HTML and CSS content
 */
function generateHtmlAndCss(
  lines: string[],
  baseName: string
): { htmlContent: string; cssContent: string } {
  // Generate CSS content with variables for colors
  const cssContent = generateCss();

  // Generate HTML content with link to CSS file
  const htmlContent = generateHtml(lines, baseName);

  return { htmlContent, cssContent };
}

/**
 * Generate CSS content with variables for colors
 * @returns - The CSS content
 */
function generateCss(): string {
  try {
    // Load CSS template from external file
    const templatePath = path.join(__dirname, 'templates', 'txxt-html.css');
    return readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error loading CSS template:', error);
    // Return a basic CSS as fallback
    return 'body { font-family: monospace; font-size: 1rem; }';
  }
}

/**
 * Generate HTML content from RFC document lines
 * @param lines - The document lines
 * @param baseName - The base name of the file (without extension)
 * @returns - The HTML content
 */
function generateHtml(lines: string[], baseName: string): string {
  const title = baseName;

  // Start building HTML content
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${baseName}.css">
</head>
<body>`;

  // Process document content
  let inToc = false;
  let inFootnotes = false;
  let inCodeBlock = false;
  let inMetadata = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle TOC
    if (trimmedLine === 'TABLE OF CONTENTS') {
      htmlContent += '<section class="toc">\n';
      htmlContent += '<h2 class="toc-title">TABLE OF CONTENTS</h2>\n';
      inToc = true;
      continue;
    }

    if (inToc) {
      if (trimmedLine === '') {
        // Check if the next non-empty line is a section
        let nextNonEmptyLine = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() !== '') {
            nextNonEmptyLine = lines[j].trim();
            break;
          }
        }

        if (isSection(nextNonEmptyLine)) {
          htmlContent += '</section>\n'; // Close TOC
          inToc = false;
        } else {
          htmlContent += '<br>\n';
        }
      } else if (trimmedLine === '-----------------') {
        // TOC separator line, skip
        continue;
      } else {
        // TOC entry
        htmlContent += `<p class="toc-entry">${escapeHtml(trimmedLine)}</p>\n`;
      }
      continue;
    }

    // Handle Footnotes
    if (trimmedLine === 'FOOTNOTES') {
      htmlContent += '<section class="footnotes-section">\n';
      htmlContent += '<h2 class="section uppercase-section">FOOTNOTES</h2>\n';
      inFootnotes = true;
      continue;
    }

    if (inFootnotes) {
      if (trimmedLine === '') {
        htmlContent += '<br>\n';
      } else {
        // Footnote entry
        const footnoteMatch = trimmedLine.match(/^\[(\d+)\]\s+(.+)$/);
        if (footnoteMatch) {
          const footnoteNum = footnoteMatch[1];
          const footnoteText = footnoteMatch[2];
          htmlContent += `<p class="footnote-item"><span class="footnote-reference">[${footnoteNum}]</span> ${processInlineFormatting(escapeHtml(footnoteText))}</p>\n`;
        } else {
          htmlContent += `<p class="paragraph">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
        }
      }
      continue;
    }

    // Handle Metadata
    if (isMetadata(trimmedLine)) {
      if (!inMetadata) {
        htmlContent += '<section class="metadata">\n';
        inMetadata = true;
      }

      const [key, value] = splitMetadata(trimmedLine);
      if (key && value) {
        htmlContent += `<p class="metadata-item"><span class="metadata-key">${escapeHtml(key)}</span> <span class="metadata-value">${escapeHtml(value)}</span></p>\n`;
      } else {
        htmlContent += `<p class="paragraph">${escapeHtml(trimmedLine)}</p>\n`;
      }
      continue;
    } else if (inMetadata && trimmedLine === '') {
      htmlContent += '</section>\n';
      inMetadata = false;
      htmlContent += '<br>\n';
      continue;
    }

    // Handle Sections
    if (isNumberedSection(trimmedLine)) {
      htmlContent += `<h2 class="section numbered-section">${escapeHtml(trimmedLine)}</h2>\n`;
      continue;
    } else if (isUppercaseSection(trimmedLine)) {
      htmlContent += `<h2 class="section uppercase-section">${escapeHtml(trimmedLine)}</h2>\n`;
      continue;
    } else if (isAlternativeSection(trimmedLine)) {
      htmlContent += `<h2 class="section alternative-section">${escapeHtml(trimmedLine)}</h2>\n`;
      continue;
    }

    // Handle Code Blocks
    if (line.startsWith('    ') && !line.startsWith('     ')) {
      if (!inCodeBlock) {
        htmlContent += '<pre class="code-block">';
        inCodeBlock = true;
      }
      htmlContent += escapeHtml(line.substring(4)) + '\n';
      continue;
    } else if (inCodeBlock) {
      htmlContent += '</pre>\n';
      inCodeBlock = false;
    }

    // Handle Lists
    if (isBulletList(trimmedLine)) {
      htmlContent += `<p class="list bullet-list">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
      continue;
    } else if (isNumberedList(trimmedLine)) {
      htmlContent += `<p class="list numbered-list">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
      continue;
    } else if (isLetteredList(trimmedLine)) {
      htmlContent += `<p class="list lettered-list">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
      continue;
    } else if (isRomanList(trimmedLine)) {
      htmlContent += `<p class="list roman-list">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
      continue;
    }

    // Handle Quotes
    if (trimmedLine.startsWith('>>')) {
      htmlContent += `<blockquote class="nested-quote">${processInlineFormatting(escapeHtml(trimmedLine.substring(2).trim()))}</blockquote>\n`;
      continue;
    } else if (trimmedLine.startsWith('>')) {
      htmlContent += `<blockquote class="quote">${processInlineFormatting(escapeHtml(trimmedLine.substring(1).trim()))}</blockquote>\n`;
      continue;
    }

    // Handle blank lines
    if (trimmedLine === '') {
      htmlContent += '<div class="blank-line"><br></div>\n';
      continue;
    }

    // Handle regular text
    htmlContent += `<p class="paragraph">${processInlineFormatting(escapeHtml(trimmedLine))}</p>\n`;
  }

  // Close any open code block
  if (inCodeBlock) {
    htmlContent += '</pre>\n';
  }

  // Close any open footnotes section
  if (inFootnotes) {
    htmlContent += '</section>\n';
  }

  // Close HTML
  htmlContent += '</body>\n</html>';

  return htmlContent;
}

/**
 * Process inline formatting (bold, italic)
 * @param text - The text to process
 * @returns - The processed text with HTML formatting
 */
function processInlineFormatting(text: string): string {
  // Process bold text (*bold*)
  text = text.replace(/\*([^*]+)\*/g, '<strong class="bold">$1</strong>');

  // Process italic text (_italic_)
  text = text.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // Process references [1]
  text = text.replace(/\[(\d+)\]/g, '<sup class="footnote-reference">[$1]</sup>');

  return text;
}

/**
 * Escape HTML special characters
 * @param text - The text to escape
 * @returns - The escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if a line is a section header
 * @param line - The line to check
 * @returns - Whether the line is a section header
 */
function isSection(line: string): boolean {
  // Check for numbered sections (e.g., "1. Section Name")
  if (isNumberedSection(line)) {
    return true;
  }

  // Check for uppercase sections (e.g., "SECTION NAME")
  if (isUppercaseSection(line)) {
    return true;
  }

  // Check for alternative sections (e.g., ": Section Name")
  if (isAlternativeSection(line)) {
    return true;
  }

  return false;
}

/**
 * Check if a line is a numbered section header
 * @param line - The line to check
 * @returns - Whether the line is a numbered section header
 */
function isNumberedSection(line: string): boolean {
  return /^\d+(\.\d+)*\.\s+\S/.test(line);
}

/**
 * Check if a line is an uppercase section header
 * @param line - The line to check
 * @returns - Whether the line is an uppercase section header
 */
function isUppercaseSection(line: string): boolean {
  return /^[A-Z][A-Z\s\-]+$/.test(line);
}

/**
 * Check if a line is an alternative section header
 * @param line - The line to check
 * @returns - Whether the line is an alternative section header
 */
function isAlternativeSection(line: string): boolean {
  return /^:\s+\S/.test(line);
}

/**
 * Check if a line is a metadata entry
 * @param line - The line to check
 * @returns - Whether the line is a metadata entry
 */
function isMetadata(line: string): boolean {
  // Metadata format: "Key          Value"
  return /^[A-Za-z][A-Za-z\s]+\s{2,}[A-Za-z0-9]/.test(line);
}

/**
 * Split a metadata line into key and value
 * @param line - The metadata line
 * @returns - The key and value
 */
function splitMetadata(line: string): [string | null, string | null] {
  const match = line.match(/^([A-Za-z][A-Za-z\s]+?)\s{2,}(.+)$/);
  if (match) {
    return [match[1].trim(), match[2].trim()];
  }
  return [null, null];
}

/**
 * Check if a line is a list item
 * @param line - The line to check
 * @returns - Whether the line is a list item
 */
function isList(line: string): boolean {
  // Check for bullet lists (e.g., "- Item")
  if (isBulletList(line)) {
    return true;
  }

  // Check for numbered lists (e.g., "1. Item")
  if (isNumberedList(line)) {
    return true;
  }

  // Check for lettered lists (e.g., "a. Item")
  if (isLetteredList(line)) {
    return true;
  }

  // Check for roman numeral lists (e.g., "i. Item")
  if (isRomanList(line)) {
    return true;
  }

  return false;
}

/**
 * Check if a line is a bullet list item
 */
function isBulletList(line: string): boolean {
  return /^\s*-\s+\S/.test(line);
}

/**
 * Check if a line is a numbered list item
 */
function isNumberedList(line: string): boolean {
  return /^\s*\d+\.\s+\S/.test(line);
}

/**
 * Check if a line is a lettered list item
 */
function isLetteredList(line: string): boolean {
  return /^\s*[a-z]\.\s+\S/.test(line);
}

/**
 * Check if a line is a roman numeral list item
 */
function isRomanList(line: string): boolean {
  return /^\s*[ivxlcdm]+\.\s+\S/.test(line);
}

/**
 * Process document references (see: file.rfc)
 */
function processDocumentReferences(text: string): string {
  return text.replace(/see:\s+([^\s]+)/g, '<a class="document-reference" href="$1">see: $1</a>');
}

/**
 * Register the export commands
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerExportCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register the export as HTML command
  const exportAsHtmlCommand = vscodeLib.registerCommand(
    context,
    'txxt.exportAsHtml',
    exportAsHtml,
    outputChannel
  );

  // Log registration
  outputChannel.appendLine('Export as HTML command registered');
}

export { registerExportCommands, exportAsHtml };
