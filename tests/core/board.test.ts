import { describe, it, expect } from 'vitest';
import { Board } from '../../src/core/board';
import { COLUMNS } from '../../src/core/constants';

describe('Board', () => {
  it('clears full lines', () => {
    const b = new Board();
    b.grid[b.grid.length - 1] = Array.from({ length: COLUMNS }, () => 'I');
    const cleared = b.clearLines();
    expect(cleared).toEqual([b.grid.length - 1]);
    expect(b.grid[0].every((c) => c === 0)).toBe(true);
  });
});