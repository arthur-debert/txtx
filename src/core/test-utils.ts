/**
 * Test utilities for the VSCode API backend system
 * These utilities help with setting up and tearing down the test environment
 */

import { BackendManager } from './backend-manager';
import * as fs from 'fs';
import { TextDocument, Uri, TextEditor, Backend } from './types';

/**
 * Test environment interface
 * Provides access to the backend and helper methods for testing
 */
export interface TestEnvironment {
  backend: Backend;
  createTextDocument: (content: string, uri?: Uri) => Promise<TextDocument>;
  createTextEditor: (document: TextDocument) => Promise<TextEditor>;
  loadFixture: (fixturePath: string) => Promise<TextDocument>;
}

/**
 * Set up the test environment
 * Switches to the headless backend and provides helper methods for testing
 * @returns The test environment
 */
export function setupTestEnvironment(): TestEnvironment {
  // Switch to headless backend
  const backend = BackendManager.setBackend('headless') as Backend;

  return {
    // Return the backend for direct access to testing methods
    backend,

    // Helper methods
    createTextDocument: async (content: string, uri?: Uri): Promise<TextDocument> => {
      const documentUri = uri || backend.Uri.file('/mock/document.rfc');
      if (backend.setDocumentContent) {
        return backend.setDocumentContent(documentUri, content);
      }
      return backend.workspace.openTextDocument(documentUri);
    },

    createTextEditor: async (document: TextDocument): Promise<TextEditor> => {
      return backend.window.showTextDocument(document);
    },

    loadFixture: async (fixturePath: string): Promise<TextDocument> => {
      const content = fs.readFileSync(fixturePath, 'utf8');
      const uri = backend.Uri.file(fixturePath);
      if (backend.setDocumentContent) {
        return backend.setDocumentContent(uri, content);
      }
      return backend.workspace.openTextDocument(uri);
    },
  };
}

/**
 * Tear down the test environment
 * Switches back to the VSCode live backend
 */
export function teardownTestEnvironment(): void {
  // Switch back to VSCode live backend
  BackendManager.setBackend('vscode-live');
}
