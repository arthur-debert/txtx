import * as vscode from 'vscode';
import * as path from 'path';
import { FOOTNOTE_REGEX, FOOTNOTE_REFERENCE_REGEX, DOCUMENT_REFERENCE_REGEX } from './constants.js';

/**
 * Document Link Provider for txxt files
 * Provides clickable links for footnotes and document references
 */
class txxtDocumentLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();

    // Find footnote references and link them to their declarations
    this.findFootnoteLinks(document, text, links, token);

    // Find document references and link them to the referenced files
    this.findDocumentReferenceLinks(document, text, links, token);

    return links;
  }

  /**
   * Find footnote references and create links to their declarations
   * @param document - The document
   * @param text - The document text
   * @param links - The links array to populate
   * @param token - The cancellation token
   */
  findFootnoteLinks(
    document: vscode.TextDocument,
    text: string,
    links: vscode.DocumentLink[],
    token: vscode.CancellationToken
  ): void {
    // First, find all footnote declarations and their positions
    const footnoteDeclarations = new Map<string, vscode.Position>();
    let match: RegExpExecArray | null;

    FOOTNOTE_REGEX.lastIndex = 0;
    while ((match = FOOTNOTE_REGEX.exec(text)) !== null) {
      if (token.isCancellationRequested) return;

      const footnoteNumber = match[1];
      const position = document.positionAt(match.index);
      footnoteDeclarations.set(footnoteNumber, position);
    }

    // Then find all footnote references and link them to their declarations
    FOOTNOTE_REFERENCE_REGEX.lastIndex = 0;
    while ((match = FOOTNOTE_REFERENCE_REGEX.exec(text)) !== null) {
      if (token.isCancellationRequested) return;

      const footnoteNumber = match[1];
      const declarationPosition = footnoteDeclarations.get(footnoteNumber);

      if (declarationPosition) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);

        // Create a document-internal link
        const target = document.uri.with({
          fragment: `L${declarationPosition.line + 1}`,
        });

        links.push(new vscode.DocumentLink(range, target));
      }
    }
  }

  /**
   * Find document references and create links to the referenced files
   * @param document - The document
   * @param text - The document text
   * @param links - The links array to populate
   * @param token - The cancellation token
   */
  findDocumentReferenceLinks(
    document: vscode.TextDocument,
    text: string,
    links: vscode.DocumentLink[],
    token: vscode.CancellationToken
  ): void {
    DOCUMENT_REFERENCE_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = DOCUMENT_REFERENCE_REGEX.exec(text)) !== null) {
      if (token.isCancellationRequested) return;

      const filePath = match[1];
      const anchor = match[2] || '';

      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      // Resolve the file path relative to the current document
      const documentDir = path.dirname(document.uri.fsPath);
      const targetPath = path.resolve(documentDir, filePath);

      // Create a link to the target file
      const target = vscode.Uri.file(targetPath).with({
        fragment: anchor,
      });

      links.push(new vscode.DocumentLink(range, target));
    }
  }
}

export default txxtDocumentLinkProvider;
