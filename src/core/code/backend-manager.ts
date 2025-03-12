/**
 * Backend Manager
 * Handles backend selection and initialization
 */

import { Backend } from './types';

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
  initialize(): void {
    // We'll dynamically import the backends to avoid circular dependencies
    // and to ensure they're only loaded when needed
    this.registerBackend('vscode-live', require('./backends/vscode-live').VSCodeLiveBackend);
    this.registerBackend('headless', require('./backends/headless').HeadlessBackend);
  }
  
  /**
   * Get the current backend
   */
  get current(): Backend {
    // Lazy load the backends if they haven't been loaded yet
    if (Object.keys(this._backends).length === 0) {
      this.initialize();
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