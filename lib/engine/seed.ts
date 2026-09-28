import { createHash } from 'node:crypto';

export function dailySeed(input: {
  userId: string;
  localDate: string;
  engineVersion: string;
  salt: string;
}) {
  const raw = `${input.userId}|${input.localDate}|${input.engineVersion}|${input.salt}`;
  return createHash('sha256').update(raw).digest('hex');
}

export function seededIndex(seedHex: string, size: number, offset = 0) {
  if (size <= 0) throw new Error('size must be positive');
  const slice = seedHex.slice(offset, offset + 12) || seedHex.slice(0, 12);
  return Number(BigInt(`0x${slice}`) % BigInt(size));
}
