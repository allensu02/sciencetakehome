import type { InputEvent } from '../types';
import type { InputHandler } from './InputHandler';

export class KeyboardHandler implements InputHandler {
  private onInput: ((event: InputEvent) => void) | null = null;
  private readonly listener = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const key = event.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) {
      return;
    }
    event.preventDefault();
    this.onInput?.({ symbol: key, timestamp_ms: performance.now() });
  };

  start(onInput: (event: InputEvent) => void): void {
    this.onInput = onInput;
    window.addEventListener('keydown', this.listener);
  }

  stop(): void {
    window.removeEventListener('keydown', this.listener);
    this.onInput = null;
  }

  expectsTarget(_target: string): void {
    // Keyboard input is atomic per keypress; the core session owns matching.
  }
}
