import type { SessionConfig } from '../types';

// Curated common 3-letter English words. Kept as a fixed alphabet and sampled i.i.d. with replacement.
export const COMMON_3_WORDS = [
  'the', 'and', 'for', 'you', 'are', 'can', 'but', 'all', 'one', 'out',
  'not', 'was', 'has', 'our', 'may', 'use', 'any', 'see', 'his', 'who',
  'now', 'get', 'how', 'its', 'had', 'day', 'two', 'her', 'add', 'she',
  'set', 'map', 'way', 'off', 'did', 'car', 'own', 'end', 'him', 'per',
  'big', 'law', 'art', 'old', 'why', 'low', 'man', 'job', 'too', 'men',
  'box', 'yes', 'yet', 'put', 'try', 'lot', 'ask', 'due', 'ago', 'let',
  'run', 'air', 'fun', 'say', 'cat', 'dog', 'red', 'top', 'hot', 'son',
  'sea', 'sun', 'bed', 'war', 'far', 'bar', 'cut', 'pay', 'win', 'hit',
  'bit', 'fit', 'sit', 'got', 'ten', 'six', 'age', 'eye', 'ear', 'arm',
  'leg', 'oil', 'cup', 'bag', 'hat', 'pen', 'key', 'ice', 'row', 'new'
] as const;

export const common3CharConfig: SessionConfig = {
  condition_id: 'three_char_common_words_n100',
  alphabet: [...COMMON_3_WORDS],
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
