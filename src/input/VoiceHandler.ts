import type { InputEvent } from '../types';
import type { InputHandler } from './InputHandler';

export class VoiceHandler implements InputHandler {
  start(_onInput: (event: InputEvent) => void): void {
    // TODO: implement via Web Speech API or local Whisper.
    throw new Error('not implemented');
  }

  stop(): void {
    throw new Error('not implemented');
  }

  expectsTarget(_target: string): void {
    throw new Error('not implemented');
  }
}
