import type { SessionConfig } from '../types';
import { REAL_3_CHAR_STRINGS, REAL_5_CHAR_STRINGS } from './nonwordExclusions';

function makeConfig(conditionId: string, alphabet: readonly string[]): SessionConfig {
  return {
    condition_id: conditionId,
    alphabet: [...alphabet],
    input_modality: 'keyboard',
    scoring: {
      mode: 'exact_match',
      advance_on_error: true
    },
    display: {
      show_current_target: true,
      show_next_target: false,
      show_keyboard_overlay: false,
      require_space: true
    },
    duration_seconds: 60,
    familiarization_seconds: 20
  };
}

export const all3CharWordsConfig = makeConfig(
  `three_char_all_words_n${REAL_3_CHAR_STRINGS.length}`,
  REAL_3_CHAR_STRINGS
);

export const all5CharWordsConfig = makeConfig(
  `five_char_all_words_n${REAL_5_CHAR_STRINGS.length}`,
  REAL_5_CHAR_STRINGS
);
