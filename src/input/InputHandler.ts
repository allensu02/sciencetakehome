import type { InputEvent } from '../types';

export interface InputHandler {
  start(onInput: (event: InputEvent) => void): void;
  stop(): void;
  expectsTarget(target: string): void;
}
