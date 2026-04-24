import type { InputEvent } from '../types';
import type { InputHandler } from './InputHandler';

export class HeadTrackingHandler implements InputHandler {
  start(_onInput: (event: InputEvent) => void): void {
    // TODO: implement via webcam, WebHID, or a dedicated head-tracking device.
    throw new Error('not implemented');
  }

  stop(): void {
    throw new Error('not implemented');
  }

  expectsTarget(_target: string): void {
    throw new Error('not implemented');
  }
}
