import type { GeneratedAlphabetConfig, SessionConfig } from '../types';
import { randomIndex, drawUniform } from './rng';
import { REAL_3_CHAR_STRINGS, REAL_5_CHAR_STRINGS } from '../configs/nonwordExclusions';

const EXCLUSIONS_BY_LENGTH: Record<number, Set<string>> = {
  3: new Set(REAL_3_CHAR_STRINGS),
  5: new Set(REAL_5_CHAR_STRINGS)
};

export const ERGONOMIC_CHAR_ORDER = 'fghjkdslrtyuibnewoavmpczxq';
export const FULL_3_CHAR_NONWORD_COUNT = 16_009;
export const FULL_5_CHAR_NONWORD_COUNT = 11_871_011;
export const FIVE_CHAR_TOP_100K_RANK_LIMIT = 100_001;
export const FIVE_CHAR_FULL_RANK_LIMIT = 26 ** 5;

export function alphabetSize(config: SessionConfig): number {
  if (config.alphabet) {
    return config.alphabet.length;
  }
  if (!config.generated_alphabet) {
    throw new Error(`Config ${config.condition_id} does not define an alphabet`);
  }
  return config.generated_alphabet.size;
}

export function drawTarget(config: SessionConfig): string {
  if (config.alphabet) {
    return drawUniform(config.alphabet);
  }
  if (!config.generated_alphabet) {
    throw new Error(`Config ${config.condition_id} does not define an alphabet`);
  }
  return drawGeneratedTarget(config.generated_alphabet);
}

export function makeGeneratedErgonomicNonwordAlphabet(
  length: 3 | 5,
  size: number,
  rankLimit: number
): GeneratedAlphabetConfig {
  return {
    kind: 'ergonomic_nonword',
    length,
    size,
    rank_limit: rankLimit,
    char_order: ERGONOMIC_CHAR_ORDER,
    excluded_sources: ['/usr/share/dict/words', 'first20hours/google-10000-english', 'blocklist']
  };
}

function drawGeneratedTarget(config: GeneratedAlphabetConfig): string {
  while (true) {
    const rank = randomIndex(config.rank_limit);
    const candidate = wordFromRank(rank, config.length, config.char_order);
    if (!isExcluded(candidate)) {
      return candidate;
    }
  }
}

export function wordFromRank(rank: number, length: number, charOrder = ERGONOMIC_CHAR_ORDER): string {
  let word = '';
  let value = rank;
  for (let index = 0; index < length; index += 1) {
    word = charOrder[value % charOrder.length] + word;
    value = Math.floor(value / charOrder.length);
  }
  return word;
}

function isExcluded(word: string): boolean {
  return EXCLUSIONS_BY_LENGTH[word.length]?.has(word) ?? false;
}
