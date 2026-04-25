import { randomIndex } from '../core/rng';
import { alphabetSize } from '../core/alphabet';
import type { SessionConfig } from '../types';

export type AuditResult = {
  draws: number;
  alphabetSize: number;
  chiSquared: number;
  lag1Correlation: number;
  minCount: number;
  maxCount: number;
};

export function runIidAudit(config: SessionConfig, draws = 100_000): AuditResult {
  const size = alphabetSize(config);
  const useDenseCounts = size <= 1_000_000;
  const denseCounts = useDenseCounts ? new Array<number>(size).fill(0) : null;
  const sparseCounts = useDenseCounts ? null : new Map<number, number>();
  const indices: number[] = [];

  for (let index = 0; index < draws; index += 1) {
    const drawn = randomIndex(size);
    if (denseCounts) {
      denseCounts[drawn] += 1;
    } else if (sparseCounts) {
      sparseCounts.set(drawn, (sparseCounts.get(drawn) ?? 0) + 1);
    }
    indices.push(drawn);
  }

  const expected = draws / size;
  const counts = denseCounts ?? [...(sparseCounts?.values() ?? [])];
  const observedChiSquared = counts.reduce((sum, count) => sum + ((count - expected) ** 2) / expected, 0);
  const unseenCount = denseCounts ? 0 : size - counts.length;
  const chiSquared = observedChiSquared + unseenCount * expected;
  const lag1Correlation = serialCorrelation(indices);
  const result = {
    draws,
    alphabetSize: size,
    chiSquared,
    lag1Correlation,
    minCount: denseCounts ? Math.min(...counts) : 0,
    maxCount: Math.max(...counts)
  };

  console.table(result);
  return result;
}

function serialCorrelation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const left = values.slice(0, -1);
  const right = values.slice(1);
  const meanLeft = mean(left);
  const meanRight = mean(right);
  let numerator = 0;
  let denomLeft = 0;
  let denomRight = 0;

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index] - meanLeft;
    const b = right[index] - meanRight;
    numerator += a * b;
    denomLeft += a * a;
    denomRight += b * b;
  }

  const denominator = Math.sqrt(denomLeft * denomRight);
  return denominator === 0 ? 0 : numerator / denominator;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
