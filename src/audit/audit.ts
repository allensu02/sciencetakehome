import { randomIndex } from '../core/rng';

export type AuditResult = {
  draws: number;
  alphabetSize: number;
  chiSquared: number;
  lag1Correlation: number;
  minCount: number;
  maxCount: number;
};

export function runIidAudit(alphabet: string[], draws = 100_000): AuditResult {
  const counts = new Array<number>(alphabet.length).fill(0);
  const indices: number[] = [];

  for (let index = 0; index < draws; index += 1) {
    const drawn = randomIndex(alphabet.length);
    counts[drawn] += 1;
    indices.push(drawn);
  }

  const expected = draws / alphabet.length;
  const chiSquared = counts.reduce((sum, count) => sum + ((count - expected) ** 2) / expected, 0);
  const lag1Correlation = serialCorrelation(indices);
  const result = {
    draws,
    alphabetSize: alphabet.length,
    chiSquared,
    lag1Correlation,
    minCount: Math.min(...counts),
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
