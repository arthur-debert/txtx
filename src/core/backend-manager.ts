/**
 * Backend Manager
 * Handles backend selection and initialization
 */

import { Backend } from './types.js';

/**
 * Backend Manager class
 * Manages backend selection and initialization
 */
class BackendManagerClass {
  private _backends: Record<string, Backend> = {};
  private _currentBackend: string = 'vscode-live';
  
  /**
   * Initialize the backend manager
   * This is called when the module is loaded
   */
  async initialize(): Promise<void> {
    // We'll dynamically import the backends to avoid circular dependencies
    // and to ensure they're only loaded when needed
    const vscodeLive = await import('./backends/vscode-live/index.js');
    const headless = await import('./backends/headless/index.js');
    this.registerBackend('vscode-live', vscodeLive.VSCodeLiveBackend);
    this.registerBackend('headless', headless.HeadlessBackend);
  }
  
  /**
   * Get the current backend
   */
  get current(): Backend {
    // Lazy load the backends if they haven't been loaded yet
    if (Object.keys(this._backends).length === 0) {
      // Since initialize is now async, we need to handle this differently
      // For now, we'll throw an error if the backends aren't loaded
      throw new Error('Backends not initialized. Please call initialize() first.');
    }
    
    return this._backends[this._currentBackend];
  }
  
  /**
   * Set the current backend
   * @param name The name of the backend to set
   * @returns The backend that was set
   */
  setBackend(name: string): Backend {
    if (!this._backends[name]) {
      throw new Error(`Backend not found: ${name}`);
    }
    this._currentBackend = name;
    return this.current;
  }
  
  /**
   * Register a backend
   * @param name The name of the backend
   * @param backendClass The backend class
   */
  registerBackend(name: string, backendClass: new () => Backend): void {
    this._backends[name] = new backendClass();
  }
}

// Create a singleton instance
export const BackendManager = new BackendManagerClass();