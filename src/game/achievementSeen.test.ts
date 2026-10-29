import { describe, expect, it } from 'vitest';
import { newlyUnlockedIds } from './achievementSeen';

describe('achievement seen ledger', () => {
  it('returns only ids that are new', () => {
    expect(newlyUnlockedIds(['a', 'b', 'c'], ['a'])).toEqual(['b', 'c']);
  });

  it('returns nothing when everything was already seen', () => {
    expect(newlyUnlockedIds(['a', 'b'], ['b', 'a', 'z'])).toEqual([]);
  });

  it('handles empty inputs', () => {
    expect(newlyUnlockedIds([], ['a'])).toEqual([]);
    expect(newlyUnlockedIds(['a'], [])).toEqual(['a']);
  });

  it('keeps the current order', () => {
    expect(newlyUnlockedIds(['x', 'y', 'z'], ['y'])).toEqual(['x', 'z']);
  });
});
