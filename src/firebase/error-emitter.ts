import { EventEmitter } from 'events';

// A simple event emitter to broadcast permission errors globally.
export const errorEmitter = new EventEmitter();
