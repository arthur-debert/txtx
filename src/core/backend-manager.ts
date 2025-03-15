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
  private _initialized: boolean = false;
  
  /**
   * Initialize the backend manager
   * This is called when the module is loaded
   */
  async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    try {
      // We'll dynamically import the backends to avoid circular dependencies
      // and to ensure they're only loaded when needed
      const [vscodeLive, headless] = await Promise.all([
        import('./backends/vscode-live/index.js'),
        import('./backends/headless/index.js')
      ]);

      this.registerBackend('vscode-live', vscodeLive.VSCodeLiveBackend);
      this.registerBackend('headless', headless.HeadlessBackend);
      
      this._initialized = true;
    } catch (error) {
      this._initialized = false;
      throw new Error(`Failed to initialize backends: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get the current backend
   */
  get current(): Backend {
    if (!this._initialized) {
      throw new Error('Backends not initialized. Please call initialize() first.');
    }
    
    const backend = this._backends[this._currentBackend];
    if (!backend) {
      throw new Error(`Current backend "${this._currentBackend}" not found. Available backends: ${Object.keys(this._backends).join(', ')}`);
    }
    
    return backend;
  }
  
  /**
   * Set the current backend
   * @param name The name of the backend to set
   * @returns The backend that was set
   */
  setBackend(name: string): Backend {
    if (!this._initialized) {
      throw new Error('Backends not initialized. Please call initialize() first.');
    }

    if (!this._backends[name]) {
      throw new Error(`Backend "${name}" not found. Available backends: ${Object.keys(this._backends).join(', ')}`);
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

  /**
   * Check if the backend manager is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }
}

// Create and export the singleton instance
const BackendManager = new BackendManagerClass();
export { BackendManager };