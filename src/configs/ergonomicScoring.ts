type Hand = 'left' | 'right';
type Finger = 'pinky' | 'ring' | 'middle' | 'index';

type KeyInfo = {
  row: number;
  col: number;
  hand: Hand;
  finger: Finger;
  fingerIndex: number;
};

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
] as const;

const FINGERS: Record<string, Omit<KeyInfo, 'row' | 'col'>> = {
  q: { hand: 'left', finger: 'pinky', fingerIndex: 0 },
  a: { hand: 'left', finger: 'pinky', fingerIndex: 0 },
  z: { hand: 'left', finger: 'pinky', fingerIndex: 0 },
  w: { hand: 'left', finger: 'ring', fingerIndex: 1 },
  s: { hand: 'left', finger: 'ring', fingerIndex: 1 },
  x: { hand: 'left', finger: 'ring', fingerIndex: 1 },
  e: { hand: 'left', finger: 'middle', fingerIndex: 2 },
  d: { hand: 'left', finger: 'middle', fingerIndex: 2 },
  c: { hand: 'left', finger: 'middle', fingerIndex: 2 },
  r: { hand: 'left', finger: 'index', fingerIndex: 3 },
  f: { hand: 'left', finger: 'index', fingerIndex: 3 },
  v: { hand: 'left', finger: 'index', fingerIndex: 3 },
  t: { hand: 'left', finger: 'index', fingerIndex: 3 },
  g: { hand: 'left', finger: 'index', fingerIndex: 3 },
  b: { hand: 'left', finger: 'index', fingerIndex: 3 },
  y: { hand: 'right', finger: 'index', fingerIndex: 6 },
  h: { hand: 'right', finger: 'index', fingerIndex: 6 },
  n: { hand: 'right', finger: 'index', fingerIndex: 6 },
  u: { hand: 'right', finger: 'index', fingerIndex: 6 },
  j: { hand: 'right', finger: 'index', fingerIndex: 6 },
  m: { hand: 'right', finger: 'index', fingerIndex: 6 },
  i: { hand: 'right', finger: 'middle', fingerIndex: 7 },
  k: { hand: 'right', finger: 'middle', fingerIndex: 7 },
  o: { hand: 'right', finger: 'ring', fingerIndex: 8 },
  l: { hand: 'right', finger: 'ring', fingerIndex: 8 },
  p: { hand: 'right', finger: 'pinky', fingerIndex: 9 }
};

const FINGER_PENALTY: Record<Finger, number> = {
  index: 0,
  middle: 0.08,
  ring: 0.2,
  pinky: 0.42
};

const ROW_PENALTY = [0.32, 0, 0.52] as const;
const KEY_INFO = buildKeyInfo();

export function selectErgonomicWords(candidates: readonly string[], limit: number): string[] {
  const seen = new Set<string>();
  return candidates
    .filter((word) => {
      if (seen.has(word)) {
        return false;
      }
      seen.add(word);
      return /^[a-z]+$/.test(word);
    })
    .map((word, sourceRank) => ({
      word,
      score: ergonomicScore(word, sourceRank)
    }))
    .sort((a, b) => a.score - b.score || a.word.localeCompare(b.word))
    .slice(0, limit)
    .map(({ word }) => word);
}

function buildKeyInfo(): Record<string, KeyInfo> {
  const info: Record<string, KeyInfo> = {};
  ROWS.forEach((row, rowIndex) => {
    row.forEach((key, colIndex) => {
      const stagger = rowIndex === 1 ? 0.25 : rowIndex === 2 ? 0.75 : 0;
      info[key] = {
        row: rowIndex,
        col: colIndex + stagger,
        ...FINGERS[key]
      };
    });
  });
  return info;
}

function ergonomicScore(word: string, sourceRank: number): number {
  let cost = 0;
  for (const char of word) {
    const key = KEY_INFO[char];
    cost += 1 + ROW_PENALTY[key.row] + FINGER_PENALTY[key.finger];
  }

  for (let index = 1; index < word.length; index += 1) {
    cost += transitionCost(word[index - 1], word[index]);
  }

  return cost / word.length + sourceRank * 0.00005;
}

function transitionCost(previous: string, next: string): number {
  if (previous === next) {
    return 0.12;
  }

  const from = KEY_INFO[previous];
  const to = KEY_INFO[next];
  const distance = Math.hypot(from.col - to.col, (from.row - to.row) * 1.05);
  let cost = 0.18 * distance + 0.25 * Math.abs(from.row - to.row);

  if (from.hand !== to.hand) {
    return cost - 0.22;
  }

  cost += 0.18;
  if (from.finger === to.finger) {
    cost += 1.15 * Math.max(1, distance);
  }

  const inwardRoll = from.hand === 'left'
    ? from.fingerIndex < to.fingerIndex
    : from.fingerIndex > to.fingerIndex;
  if (Math.abs(from.fingerIndex - to.fingerIndex) <= 2 && from.finger !== to.finger) {
    cost += inwardRoll ? -0.18 : 0.1;
  }

  return cost;
}
