import type { SessionConfig } from '../types';

// Ergonomic 3-character English words selected from a cleaned Google 10k + system
// dictionary pool using the QWERTY effort model in ergonomicScoring.ts.
export const ERGONOMIC_3_WORDS = [
  'add', 'had', 'her', 'off', 'see', 'out', 'the', 'dry', 'she', 'set',
  'yet', 'our', 'ask', 'gas', 'egg', 'fee', 'eye', 'but', 'too', 'fit',
  'get', 'yes', 'was', 'hey', 'due', 'got', 'all', 'hit', 'key', 'dad',
  'fig', 'wet', 'bug', 'oil', 'sad', 'few', 'ash', 'its', 'use', 'saw',
  'put', 'you', 'big', 'say', 'day', 'ill', 'did', 'for', 'hot', 'fly',
  'jet', 'let', 'bit', 'far', 'cut', 'top', 'are', 'dog', 'rug', 'sky',
  'his', 'sea', 'gay', 'toy', 'inn', 'odd', 'ago', 'sat', 'tee', 'try',
  'die', 'per', 'fur', 'him', 'and', 'web', 'net', 'flu', 'bad', 'age',
  'end', 'tie', 'guy', 'tip', 'gig', 'sur', 'fat', 'pop', 'sit', 'law',
  'era', 'bid', 'joy', 'sub', 'who', 'dot', 'lie', 'new', 'fan', 'way'
] as const;

export const ergonomic3CharConfig: SessionConfig = {
  condition_id: 'three_char_ergonomic_words_n100',
  alphabet: [...ERGONOMIC_3_WORDS],
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
