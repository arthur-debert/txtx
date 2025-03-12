/**
 * Test utilities for the VSCode API backend system
 * These utilities help with setting up and tearing down the test environment
 */

import { BackendManager } from './backend-manager';
import * as fs from 'fs';
import * as path from 'path';
import { TextDocument, Uri } from './types';

/**
 * Test environment interface
 * Provides access to the backend and helper methods for testing
 */
export interface TestEnvironment {
  backend: any;
  createTextDocument: (content: string, uri?: any, languageId?: string) => TextDocument;
  createTextEditor: (document: TextDocument) => any;
  loadFixture: (fixturePath: string) => TextDocument;
}

/**
 * Set up the test environment
 * Switches to the headless backend and provides helper methods for testing
 * @returns The test environment
 */
export function setupTestEnvironment(): TestEnvironment {
  // Switch to headless backend
  const backend = BackendManager.setBackend('headless');
  
  return {
    // Return the backend for direct access to testing methods
    backend,
    
    // Helper methods
    createTextDocument: (content: string, uri?: any, languageId?: string): TextDocument => {
      const documentUri = uri || backend.Uri.file('/mock/document.rfc');
      return (backend as any)._createTextDocument(content, documentUri, languageId || 'rfcdoc');
    },
    
    createTextEditor: (document: TextDocument): any => {
      return (backend as any)._createTextEditor(document);
    },
    
    loadFixture: (fixturePath: string): TextDocument => {
      const content = fs.readFileSync(fixturePath, 'utf8');
      const uri = backend.Uri.file(fixturePath);
      return (backend as any).setDocumentContent(uri, content);
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