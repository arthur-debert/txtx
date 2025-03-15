/**
 * Headless Backend - Event Handling Features
 * This file contains implementations for Event, EventEmitter, and CancellationToken
 */

import { EventEmitter as NodeEventEmitter } from 'events';
import {
  Event,
  Disposable,
  CancellationToken
} from '../../types.js';

/**
 * Simple implementation of a disposable
 */
export class HeadlessDisposable implements Disposable {
  private _onDispose: () => void;
  
  constructor(onDispose: () => void) {
    this._onDispose = onDispose;
  }
  
  dispose(): void {
    this._onDispose();
  }
}

/**
 * Simple implementation of an event
 */
export type HeadlessEvent<T> = (listener: (e: T) => void | Promise<void>, thisArgs?: unknown, disposables?: Disposable[]) => Disposable;

/**
 * EventEmitter implementation for headless backend
 * Represents a typed event emitter
 */
export class HeadlessEventEmitter<T> {
  private _emitter: NodeEventEmitter = new NodeEventEmitter();
  private _event: Event<T>;

  constructor() {
    this._event = this._createEvent();
  }

  /**
   * Create an event
   */
  private _createEvent(): Event<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (listener: (e: T) => void | Promise<void>, thisArgs?: unknown, disposables?: Disposable[]): Disposable => {
      const wrappedListener = thisArgs ? listener.bind(thisArgs) : listener;
      this._emitter.on('event', wrappedListener);
      
      return new HeadlessDisposable(() => {
        this._emitter.off('event', wrappedListener);
      });
    };
  }
  /**
   * The event
   */
  get event(): Event<T> {
    return this._event;
  }

  /**
   * Fire the event
   * @param data The event data
   */
  fire(data: T): void {
    this._emitter.emit('event', data);
  }

  /**
   * Dispose the event emitter
   */
  dispose(): void {
    this._emitter.removeAllListeners();
  }
}

/**
 * CancellationToken implementation for headless backend
 * Represents a cancellation token
 */
export class HeadlessCancellationToken implements CancellationToken {
  private _isCancellationRequested: boolean = false;
  private _emitter: HeadlessEventEmitter<void> = new HeadlessEventEmitter<void>();

  /**
   * Whether cancellation has been requested
   */
  get isCancellationRequested(): boolean {
    return this._isCancellationRequested;
  }

  /**
   * An event which fires when cancellation is requested
   */
  get onCancellationRequested(): Event<void> {
    return this._emitter.event;
  }

  /**
   * Cancel the token
   */
  cancel(): void {
    if (!this._isCancellationRequested) {
      this._isCancellationRequested = true;
      this._emitter.fire(undefined);
    }
  }

  /**
   * Dispose the token
   */
  dispose(): void {
    this._emitter.dispose();
  }

  /**
   * Create a cancelled token
   * @returns A cancelled token
   */
  static cancelled(): CancellationToken {
    const token = new HeadlessCancellationToken();
    token.cancel();
    return token;
  }

  /**
   * Create a non-cancelled token
   * @returns A non-cancelled token
   */
  static none(): CancellationToken {
    return new HeadlessCancellationToken();
  }
}

/**
 * CancellationTokenSource implementation for headless backend
 * Represents a source of cancellation tokens
 */
export class HeadlessCancellationTokenSource {
  private _token: HeadlessCancellationToken = new HeadlessCancellationToken();

  /**
   * The token
   */
  get token(): CancellationToken {
    return this._token;
  }

  /**
   * Cancel the token
   */
  cancel(): void {
    this._token.cancel();
  }

  /**
   * Dispose the token source
   */
  dispose(): void {
    this._token.dispose();
  }
}