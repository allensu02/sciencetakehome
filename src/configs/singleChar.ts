import type { SessionConfig } from '../types';

export const singleCharConfig: SessionConfig = {
  condition_id: 'single_char_random_letters',
  alphabet: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  input_modality: 'keyboard',
  scoring: {
    mode: 'exact_match',
    advance_on_error: true
  },
  display: {
    show_current_target: true,
    show_next_target: false,
    show_keyboard_overlay: false,
    visual_letter_spacing: true
  },
  duration_seconds: 60,
  familiarization_seconds: 20
};
