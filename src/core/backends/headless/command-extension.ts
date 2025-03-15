/**
 * Headless Backend - Command and Extension Management Features
 * This file contains implementations for Commands, Extensions, and Disposable
 */

import { EventEmitter } from 'events';
import {
  Disposable
} from '../../types';

/**
 * Type for command handler arguments
 */
type CommandArgs = unknown[];

/**
 * Type for command handler return value
 */
type CommandResult = unknown;

/**
 * Type for extension exports
 */
type ExtensionExports = Record<string, unknown>;

/**
 * Disposable implementation for headless backend
 * Represents a type which can release resources when no longer needed
 */
export class HeadlessDisposable implements Disposable {
  private _onDispose: () => void;

  constructor(onDispose: () => void) {
    this._onDispose = onDispose;
  }

  /**
   * Dispose this object
   */
  dispose(): void {
    this._onDispose();
  }

  /**
   * Create a disposable from a function
   * @param func The function to call when disposed
   * @returns A disposable object
   */
  static from(func: () => void): Disposable {
    return new HeadlessDisposable(func);
  }

  /**
   * Combine multiple disposables into one
   * @param disposables The disposables to combine
   * @returns A disposable that disposes all the given disposables
   */
  static combine(...disposables: Disposable[]): Disposable {
    return new HeadlessDisposable(() => {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    });
  }
}

/**
 * Command implementation for headless backend
 * Manages commands and their execution
 */
export class HeadlessCommands {
  private _commands: Map<string, (...args: CommandArgs) => CommandResult> = new Map();
  private _eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    // Initialize with some built-in commands if needed
  }

  /**
   * Register a command
   * @param command The command ID
   * @param callback The command handler
   * @returns A disposable which unregisters the command
   */
  registerCommand(command: string, callback: (...args: CommandArgs) => CommandResult): Disposable {
    this._commands.set(command, callback);
    this._eventEmitter.emit('commandRegistered', command);
    
    return HeadlessDisposable.from(() => {
      this._commands.delete(command);
      this._eventEmitter.emit('commandUnregistered', command);
    });
  }

  /**
   * Execute a command
   * @param command The command ID
   * @param args The command arguments
   * @returns A promise that resolves with the command result
   */
  async executeCommand(command: string, ...args: CommandArgs): Promise<CommandResult> {
    const handler = this._commands.get(command);
    if (!handler) {
      throw new Error(`Command not found: ${command}`);
    }
    
    try {
      return await Promise.resolve(handler(...args));
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      throw error;
    }
  }

  /**
   * Get all registered commands
   * @returns A promise that resolves with an array of command IDs
   */
  async getCommands(): Promise<string[]> {
    return Array.from(this._commands.keys());
  }

  /**
   * Check if a command is registered
   * @param command The command ID
   * @returns True if the command is registered
   */
  hasCommand(command: string): boolean {
    return this._commands.has(command);
  }

  /**
   * Listen for command registration events
   * @param listener The listener function
   * @returns A disposable which removes the listener
   */
  onCommandRegistered(listener: (command: string) => void): Disposable {
    this._eventEmitter.on('commandRegistered', listener);
    return HeadlessDisposable.from(() => {
      this._eventEmitter.off('commandRegistered', listener);
    });
  }

  /**
   * Listen for command unregistration events
   * @param listener The listener function
   * @returns A disposable which removes the listener
   */
  onCommandUnregistered(listener: (command: string) => void): Disposable {
    this._eventEmitter.on('commandUnregistered', listener);
    return HeadlessDisposable.from(() => {
      this._eventEmitter.off('commandUnregistered', listener);
    });
  }
}

/**
 * Extension implementation for headless backend
 * Manages extensions and their activation
 */
export class HeadlessExtensions {
  private _extensions: Map<string, HeadlessExtension> = new Map();

  constructor() {
    // Initialize with some built-in extensions if needed
  }

  /**
   * Get all extensions
   * @returns An array of all extensions
   */
  getAll(): HeadlessExtension[] {
    return Array.from(this._extensions.values());
  }

  /**
   * Get an extension by ID
   * @param id The extension ID
   * @returns The extension, or undefined if not found
   */
  getExtension(id: string): HeadlessExtension | undefined {
    return this._extensions.get(id);
  }

  /**
   * Register an extension
   * @param id The extension ID
   * @param extension The extension to register
   */
  registerExtension(id: string, extension: HeadlessExtension): void {
    this._extensions.set(id, extension);
  }

  /**
   * Unregister an extension
   * @param id The extension ID
   */
  unregisterExtension(id: string): void {
    this._extensions.delete(id);
  }
}

/**
 * Extension implementation for headless backend
 * Represents an extension
 */
export class HeadlessExtension {
  id: string;
  isActive: boolean = false;
  exports: ExtensionExports = {};
  
  constructor(id: string) {
    this.id = id;
  }

  /**
   * Activate the extension
   * @returns A promise that resolves with the extension exports when the extension is activated
   */
  async activate(): Promise<ExtensionExports> {
    if (this.isActive) {
      return this.exports;
    }
    
    // In a real implementation, this would load and activate the extension
    this.isActive = true;
    return this.exports;
  }

  /**
   * Deactivate the extension
   * @returns A promise that resolves when the extension is deactivated
   */
  async deactivate(): Promise<void> {
    if (!this.isActive) {
      return;
    }
    
    // In a real implementation, this would deactivate the extension
    this.isActive = false;
  }
}