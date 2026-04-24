export function randomIndex(length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('randomIndex requires a positive integer length');
  }

  const uint32Range = 0x100000000;
  const limit = uint32Range - (uint32Range % length);
  const values = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(values);
    const value = values[0];
    if (value < limit) {
      return value % length;
    }
  }
}

export function drawUniform<T>(alphabet: T[]): T {
  if (alphabet.length === 0) {
    throw new Error('Cannot draw from an empty alphabet');
  }
  return alphabet[randomIndex(alphabet.length)];
}
