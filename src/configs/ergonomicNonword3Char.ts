import type { SessionConfig } from '../types';
import { FULL_3_CHAR_NONWORD_COUNT } from '../core/alphabet';
import { selectErgonomicWords } from './ergonomicScoring';
import { REAL_3_CHAR_STRINGS } from './nonwordExclusions';

const REAL_3_CHAR_SET = new Set(REAL_3_CHAR_STRINGS);
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';

const ERGONOMIC_NONWORD_3_STRINGS = selectErgonomicWords(makeCandidatePool(), FULL_3_CHAR_NONWORD_COUNT);

export const ERGONOMIC_NONWORD_3_TOP_100 = ERGONOMIC_NONWORD_3_STRINGS.slice(0, 100);
export const ERGONOMIC_NONWORD_3_TOP_1000 = ERGONOMIC_NONWORD_3_STRINGS.slice(0, 1000);
export const ERGONOMIC_NONWORD_3_ALL = ERGONOMIC_NONWORD_3_STRINGS;

export const ergonomicNonword3CharN100Config = makeConfig(
  'three_char_ergonomic_nonwords_n100',
  ERGONOMIC_NONWORD_3_TOP_100
);

export const ergonomicNonword3CharN1000Config = makeConfig(
  'three_char_ergonomic_nonwords_n1000',
  ERGONOMIC_NONWORD_3_TOP_1000
);

export const ergonomicNonword3CharAllConfig = makeConfig(
  `three_char_ergonomic_nonwords_n${FULL_3_CHAR_NONWORD_COUNT}`,
  ERGONOMIC_NONWORD_3_ALL
);

function makeCandidatePool(): string[] {
  const candidates: string[] = [];
  for (const first of LOWERCASE) {
    for (const second of LOWERCASE) {
      for (const third of LOWERCASE) {
        const candidate = `${first}${second}${third}`;
        if (!REAL_3_CHAR_SET.has(candidate)) {
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
}

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
