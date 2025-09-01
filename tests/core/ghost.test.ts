import { describe, it, expect } from 'vitest';
import { Board } from '../../src/core/board';
import { Piece } from '../../src/core/piece';
import { ghostY } from '../../src/core/ghost';

describe('Ghost', () => {
  it('computes final drop y equal to simulated drop', () => {
    const b = new Board();
    const p = new Piece('T');
    const gy = ghostY(p, b);

    const s = new Piece(p.kind);
    s.x = p.x;
    s.y = p.y;
    let dropCount = 0;
    while (s.move(0, 1, b)) { dropCount++; }
    expect(gy).toBe(s.y);
    expect(dropCount).toBeGreaterThanOrEqual(0);
  });
});


